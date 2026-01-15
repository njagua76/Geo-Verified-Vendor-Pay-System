"""
M-Pesa Daraja API Service

This module handles all interactions with the Safaricom M-Pesa Daraja API.
It supports:
- OAuth token generation
- B2C (Business to Customer) payments for vendor disbursements
- STK Push (Lipa Na M-Pesa Online) - for customer payments
- Payment callback handling
- Transaction status checking

Environment Variables Required:
    MPESA_CONSUMER_KEY - Daraja API consumer key
    MPESA_CONSUMER_SECRET - Daraja API consumer secret
    MPESA_SHORTCODE - Business short code (for B2C: usually 600998 in sandbox)
    MPESA_INITIATOR_NAME - API operator username (e.g., 'testapi')
    MPESA_SECURITY_CREDENTIAL - Encrypted initiator password
    MPESA_ENVIRONMENT - 'sandbox' or 'production'
    MPESA_B2C_QUEUE_TIMEOUT_URL - URL for queue timeout callbacks
    MPESA_B2C_RESULT_URL - URL for payment result callbacks
"""

import base64
import requests
import json
import os
import time
from datetime import datetime
from flask import current_app
from models import db, TransactionLog, Supplier


class MpesaService:
    """Service class for M-Pesa Daraja API operations."""
    
    # API endpoints for sandbox and production
    SANDBOX_BASE_URL = "https://sandbox.safaricom.co.ke"
    PRODUCTION_BASE_URL = "https://api.safaricom.co.ke"
    
    # OAuth endpoint
    OAUTH_ENDPOINT = "/oauth/v1/generate?grant_type=client_credentials"
    
    # B2C Payment endpoint (Business to Customer - paying vendors)
    B2C_PAYMENT_ENDPOINT = "/mpesa/b2c/v1/paymentrequest"
    
    # STK Push endpoint (Customer pays business)
    STK_PUSH_ENDPOINT = "/mpesa/stkpush/v1/processrequest"
    
    # Transaction status endpoint
    TRANSACTION_STATUS_ENDPOINT = "/mpesa/transactionstatus/v1/query"
    
    def __init__(self):
        """Initialize M-Pesa service with configuration."""
        # Load configuration from Flask config or environment variables
        self.consumer_key = current_app.config.get('MPESA_CONSUMER_KEY') or os.getenv('MPESA_CONSUMER_KEY', '')
        self.consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET') or os.getenv('MPESA_CONSUMER_SECRET', '')
        self.shortcode = current_app.config.get('MPESA_SHORTCODE') or os.getenv('MPESA_SHORTCODE', '')
        self.initiator_name = current_app.config.get('MPESA_INITIATOR_NAME') or os.getenv('MPESA_INITIATOR_NAME', 'testapi')
        self.security_credential = current_app.config.get('MPESA_SECURITY_CREDENTIAL') or os.getenv('MPESA_SECURITY_CREDENTIAL', '')
        self.environment = current_app.config.get('MPESA_ENVIRONMENT') or os.getenv('MPESA_ENVIRONMENT', 'sandbox')
        self.b2c_queue_timeout_url = current_app.config.get('MPESA_B2C_QUEUE_TIMEOUT_URL') or os.getenv('MPESA_B2C_QUEUE_TIMEOUT_URL', '')
        self.b2c_result_url = current_app.config.get('MPESA_B2C_RESULT_URL') or os.getenv('MPESA_B2C_RESULT_URL', '')
        
        # Legacy STK Push settings (keeping for compatibility)
        self.passkey = current_app.config.get('MPESA_PASSKEY') or os.getenv('MPESA_PASSKEY', '')
        self.callback_url = current_app.config.get('MPESA_CALLBACK_URL') or os.getenv('MPESA_CALLBACK_URL', '')
        
        # Set base URL based on environment
        self.base_url = self.SANDBOX_BASE_URL if self.environment == 'sandbox' else self.PRODUCTION_BASE_URL
    
    def _get_access_token(self):
        """
        Generate OAuth access token for Daraja API.
        
        This token is required for all subsequent API calls.
        Token expires after 1 hour, so should be cached in production.
        
        Returns:
            str: Access token for subsequent API calls, or None if failed
        """
        try:
            # Create authorization header with base64 encoded credentials
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.base_url}{self.OAUTH_ENDPOINT}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data.get('access_token')
                current_app.logger.info("✅ Successfully obtained M-Pesa access token")
                return access_token
            else:
                current_app.logger.error(f"❌ Failed to get access token: {response.text}")
                return None
                
        except Exception as e:
            current_app.logger.error(f"❌ Error getting access token: {str(e)}")
            return None
    
    def initiate_b2c_payment(self, phone_number, amount, supplier_id, agent_id, remarks="Vendor payment"):
        """
        Initiate B2C (Business to Customer) payment to a vendor.
        
        This is used to disburse payments to suppliers after location verification.
        Money flows FROM your business TO the recipient's M-Pesa account.
        
        Args:
            phone_number (str): Recipient's phone number (format: 254XXXXXXXXX)
            amount (float): Payment amount in KES (minimum 10 KES)
            supplier_id (int): Database ID of the supplier receiving payment
            agent_id (int): ID of the field agent initiating the payment
            remarks (str): Payment description/remarks
            
        Returns:
            dict: {
                'success': bool,
                'conversation_id': str (if successful),
                'originator_conversation_id': str (if successful),
                'message': str,
                'transaction_id': int (database transaction log ID)
            }
        """
        try:
            current_app.logger.info(f"🚀 Initiating B2C payment: {amount} KES to {phone_number}")
            
            # 1. Get OAuth access token
            access_token = self._get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'error': 'Failed to obtain M-Pesa access token'
                }
            
            # 2. Prepare B2C payment request
            # Format phone number - M-Pesa expects format: 254XXXXXXXXX (no + prefix)
            formatted_phone = phone_number.strip().replace('+', '').replace(' ', '')
            if not formatted_phone.startswith('254'):
                # If phone starts with 0, replace with 254
                formatted_phone = '254' + formatted_phone.lstrip('0')
            
            payload = {
                "InitiatorName": self.initiator_name,
                "SecurityCredential": self.security_credential,
                "CommandID": "BusinessPayment",  # For B2C payments to businesses/vendors
                "Amount": int(amount),  # Must be integer
                "PartyA": self.shortcode,  # Your business shortcode (sender)
                "PartyB": formatted_phone,  # Recipient phone number (254XXXXXXXXX)
                "Remarks": remarks,
                "QueueTimeOutURL": self.b2c_queue_timeout_url,
                "ResultURL": self.b2c_result_url,
                "Occasion": f"Payment to supplier {supplier_id}"
            }
            
            current_app.logger.info(f"📱 Formatted phone: {phone_number} -> {formatted_phone}")
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # 3. Create pending transaction log BEFORE making the request
            transaction = TransactionLog(
                supplier_id=supplier_id,
                agent_id=agent_id,
                phone_number=phone_number,
                amount=amount,
                status='PENDING',  # Initial status
                transaction_type='B2C_PAYMENT',
                description=remarks,
                distance_meters=0.0  # Set to 0 for direct B2C payments without location verification
            )
            db.session.add(transaction)
            db.session.commit()
            
            current_app.logger.info(f"📝 Created transaction log ID: {transaction.id}")
            
            # 4. Make B2C API request to M-Pesa
            response = requests.post(
                f"{self.base_url}{self.B2C_PAYMENT_ENDPOINT}",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            current_app.logger.info(f"📡 M-Pesa B2C Response Status: {response.status_code}")
            current_app.logger.info(f"📡 M-Pesa B2C Response: {response.text}")
            
            # 5. Process response
            if response.status_code == 200:
                result = response.json()
                response_code = result.get('ResponseCode', '')
                
                if response_code == '0':
                    # Success! Payment request accepted
                    conversation_id = result.get('ConversationID')
                    originator_conversation_id = result.get('OriginatorConversationID')
                    
                    # Update transaction with M-Pesa IDs
                    transaction.mpesa_checkout_id = conversation_id
                    transaction.status = 'PAYMENT_SENT'
                    transaction.result_description = result.get('ResponseDescription', 'Payment sent to M-Pesa')
                    db.session.commit()
                    
                    current_app.logger.info(f"✅ B2C Payment sent successfully. Conversation ID: {conversation_id}")
                    
                    return {
                        'success': True,
                        'conversation_id': conversation_id,
                        'originator_conversation_id': originator_conversation_id,
                        'message': 'Payment sent successfully. Recipient will receive money shortly.',
                        'transaction_id': transaction.id
                    }
                else:
                    # M-Pesa rejected the request
                    error_message = result.get('ResponseDescription', 'Payment request failed')
                    transaction.status = 'PAYMENT_FAILED'
                    transaction.result_description = error_message
                    db.session.commit()
                    
                    current_app.logger.error(f"❌ B2C Payment failed: {error_message}")
                    
                    return {
                        'success': False,
                        'error': error_message,
                        'transaction_id': transaction.id
                    }
            else:
                # HTTP error
                error_message = f"M-Pesa API error: {response.status_code} - {response.text}"
                transaction.status = 'PAYMENT_FAILED'
                transaction.result_description = error_message
                db.session.commit()
                
                current_app.logger.error(f"❌ {error_message}")
                
                return {
                    'success': False,
                    'error': error_message,
                    'transaction_id': transaction.id
                }
                
        except Exception as e:
            error_message = f"Exception during B2C payment: {str(e)}"
            current_app.logger.error(f"❌ {error_message}")
            
            # Update transaction if it exists
            if 'transaction' in locals():
                transaction.status = 'PAYMENT_FAILED'
                transaction.result_description = error_message
                db.session.commit()
                
            return {
                'success': False,
                'error': error_message,
                'transaction_id': transaction.id if 'transaction' in locals() else None
            }
    
    def _generate_stk_password(self):
        """
        Generate STK Push password.
        
        The password is a base64 encoded string of:
        shortcode + passkey + timestamp
        
        Returns:
            str: Encoded password for STK Push
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_string = f"{self.shortcode}{self.passkey}{timestamp}"
        encoded_password = base64.b64encode(password_string.encode()).decode()
        return encoded_password, timestamp
    
    def initiate_stk_push(self, phone_number, amount, reference, description, agent_id):
        """
        Initiate STK Push payment request.
        
        Args:
            phone_number (str): Customer's phone number (format: 254XXXXXXXXX)
            amount (float): Payment amount in KES
            reference (str): Transaction reference/Account number
            description (str): Payment description
            agent_id (int): ID of the field agent making the request
            
        Returns:
            dict: Response containing checkout request ID and status
        """
        try:
            # Get access token
            access_token = self._get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'error': 'Failed to get access token'
                }
            
            # Generate STK password
            password, timestamp = self._generate_stk_password()
            
            # Prepare request payload
            payload = {
                "BusinessShortCode": self.shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline" if len(self.shortcode) == 12 else "CustomerBuyGoodsOnline",
                "Amount": int(amount),
                "PartyA": phone_number,
                "PartyB": self.shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": self.callback_url,
                "AccountReference": reference,
                "TransactionDesc": description
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            current_app.logger.info(f"Initiating STK Push to {phone_number} for KES {amount}")
            
            response = requests.post(
                f"{self.base_url}{self.STK_PUSH_ENDPOINT}",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('ResponseCode') == '0':
                    # Create pending transaction log
                    transaction = TransactionLog(
                        supplier_id=int(reference),
                        agent_id=agent_id,
                        mpesa_checkout_id=result.get('CheckoutRequestID'),
                        phone_number=phone_number,
                        amount=amount,
                        status='pending',
                        transaction_type='stk_push',
                        description=description
                    )
                    db.session.add(transaction)
                    db.session.commit()
                    
                    return {
                        'success': True,
                        'checkout_request_id': result.get('CheckoutRequestID'),
                        'transaction_id': result.get('MerchantRequestID'),
                        'message': result.get('ResponseDescription', 'STK Push sent successfully')
                    }
                else:
                    return {
                        'success': False,
                        'error': result.get('ResponseDescription', 'STK Push failed')
                    }
            else:
                current_app.logger.error(f"STK Push failed: {response.text}")
                return {
                    'success': False,
                    'error': f"API Error: {response.status_code}"
                }
                
        except Exception as e:
            current_app.logger.error(f"Error initiating STK Push: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_callback(self, callback_data):
        """
        Process M-Pesa payment callback.
        
        Args:
            callback_data (dict): Callback data from M-Pesa
            
        Returns:
            dict: Processing result
        """
        try:
            # Extract callback information
            stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            
            # Find the transaction
            transaction = TransactionLog.query.filter_by(
                mpesa_checkout_id=checkout_request_id
            ).first()
            
            if not transaction:
                current_app.logger.warning(f"Transaction not found for checkout ID: {checkout_request_id}")
                return {'success': False, 'error': 'Transaction not found'}
            
            if result_code == 0:
                # Payment successful
                callback_metadata = stk_callback.get('CallbackMetadata', {})
                items = callback_metadata.get('Item', [])
                
                # Extract transaction details from metadata
                mpesa_receipt = None
                transaction_date = None
                
                for item in items:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        mpesa_receipt = item.get('Value')
                    elif item.get('Name') == 'TransactionDate':
                        transaction_date = item.get('Value')
                
                transaction.status = 'success'
                transaction.mpesa_receipt_number = mpesa_receipt
                transaction.result_description = result_desc
                
                if transaction_date:
                    # Parse transaction date (format: YYYYMMDDHHMMSS)
                    try:
                        transaction.transaction_date = datetime.strptime(
                            str(transaction_date), '%Y%m%d%H%M%S'
                        )
                    except:
                        pass
                
                db.session.commit()
                
                return {
                    'success': True,
                    'transaction_id': transaction.id,
                    'mpesa_receipt': mpesa_receipt,
                    'status': 'success'
                }
            else:
                # Payment failed
                transaction.status = 'failed'
                transaction.result_description = result_desc
                db.session.commit()
                
                return {
                    'success': False,
                    'transaction_id': transaction.id,
                    'error': result_desc,
                    'status': 'failed'
                }
                
        except Exception as e:
            current_app.logger.error(f"Error processing callback: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def check_transaction_status(self, checkout_request_id):
        """
        Check the status of a transaction.
        
        Args:
            checkout_request_id (str): The checkout request ID from STK Push
            
        Returns:
            dict: Transaction status information
        """
        try:
            access_token = self._get_access_token()
            if not access_token:
                return {'success': False, 'error': 'Failed to get access token'}
            
            # Find transaction
            transaction = TransactionLog.query.filter_by(
                mpesa_checkout_id=checkout_request_id
            ).first()
            
            if not transaction:
                return {'success': False, 'error': 'Transaction not found'}
            
            # Generate password for query
            password, timestamp = self._generate_stk_password()
            
            payload = {
                "BusinessShortCode": self.shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "TransactionStatusQuery",
                "TransactionID": transaction.mpesa_receipt_number or "",
                "PartyA": self.shortcode,
                "PartyB": self.shortcode,
                "IdentifierType": 4,
                "Remarks": "Checking transaction status",
                "Occasion": "StatusCheck"
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.base_url}{self.TRANSACTION_STATUS_ENDPOINT}",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'status': result.get('ResultDesc'),
                    'data': result
                }
            else:
                return {
                    'success': False,
                    'error': f"API Error: {response.status_code}"
                }
                
        except Exception as e:
            current_app.logger.error(f"Error checking transaction status: {str(e)}")
            return {'success': False, 'error': str(e)}


def initiate_payment(phone_number, amount, supplier_id, agent_id, description="Payment for goods/services"):
    """
    Convenience function to initiate a payment.
    
    Args:
        phone_number (str): Customer's phone number
        amount (float): Payment amount
        supplier_id (int): Supplier ID (used as account reference)
        agent_id (int): Field agent ID
        description (str): Payment description
        
    Returns:
        dict: Payment initiation result
    """
    mpesa = MpesaService()
    reference = str(supplier_id)
    
    return mpesa.initiate_stk_push(
        phone_number=phone_number,
        amount=amount,
        reference=reference,
        description=description,
        agent_id=agent_id
    )


def process_mpesa_callback(callback_data):
    """
    Convenience function to process M-Pesa callback.
    
    Args:
        callback_data (dict): Callback data from M-Pesa
        
    Returns:
        dict: Processing result
    """
    mpesa = MpesaService()
    return mpesa.process_callback(callback_data)


def initiate_vendor_payment(phone_number, amount, supplier_id, agent_id, remarks="Vendor disbursement"):
    """
    Convenience function to initiate B2C payment to a vendor.
    
    This is the main function you'll use for paying vendors after location verification.
    
    Args:
        phone_number (str): Vendor's M-Pesa phone number (format: 254XXXXXXXXX)
        amount (float): Payment amount in KES
        supplier_id (int): Database ID of the supplier
        agent_id (int): ID of the field agent initiating payment
        remarks (str): Payment description
        
    Returns:
        dict: {
            'success': bool,
            'conversation_id': str (if successful),
            'message': str,
            'transaction_id': int
        }
        
    Example:
        result = initiate_vendor_payment(
            phone_number='254712345678',
            amount=100,
            supplier_id=1,
            agent_id=5,
            remarks='Payment for verified delivery'
        )
        
        if result['success']:
            print(f"Payment sent! Transaction ID: {result['transaction_id']}")
        else:
            print(f"Payment failed: {result['error']}")
    """
    mpesa = MpesaService()
    return mpesa.initiate_b2c_payment(
        phone_number=phone_number,
        amount=amount,
        supplier_id=supplier_id,
        agent_id=agent_id,
        remarks=remarks
    )


