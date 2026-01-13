"""
M-Pesa Daraja API Service

This module handles all interactions with the Safaricom M-Pesa Daraja API.
It supports:
- OAuth token generation
- STK Push (Lipa Na M-Pesa Online)
- Payment callback handling
- Transaction status checking

Environment Variables Required:
    MPESA_CONSUMER_KEY - Daraja API consumer key
    MPESA_CONSUMER_SECRET - Daraja API consumer secret
    MPESA_SHORTCODE - Business short code (paybill/till)
    MPESA_PASSKEY - Online payment passkey
    MPESA_ENVIRONMENT - 'sandbox' or 'production'
    MPESA_CALLBACK_URL - URL for payment callbacks
"""

import base64
import requests
import json
import os
import time
from datetime import datetime
from flask import current_app
from backend.models import db, TransactionLog, Supplier


class MpesaService:
    """Service class for M-Pesa Daraja API operations."""
    
    # API endpoints for sandbox and production
    SANDBOX_BASE_URL = "https://sandbox.safaricom.co.ke"
    PRODUCTION_BASE_URL = "https://api.safaricom.co.ke"
    
    # STK Push endpoint
    STK_PUSH_ENDPOINT = "/mpesa/stkpush/v1/processrequest"
    
    # OAuth endpoint
    OAUTH_ENDPOINT = "/oauth/v1/generate?grant_type=client_credentials"
    
    # Transaction status endpoint
    TRANSACTION_STATUS_ENDPOINT = "/mpesa/transactionstatus/v1/query"
    
    def __init__(self):
        """Initialize M-Pesa service with configuration."""
        # Try to get from Flask config first, then fall back to environment variables
        self.consumer_key = current_app.config.get('MPESA_CONSUMER_KEY') or os.getenv('MPESA_CONSUMER_KEY', '')
        self.consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET') or os.getenv('MPESA_CONSUMER_SECRET', '')
        self.shortcode = current_app.config.get('MPESA_SHORTCODE') or os.getenv('MPESA_SHORTCODE', '')
        self.passkey = current_app.config.get('MPESA_PASSKEY') or os.getenv('MPESA_PASSKEY', '')
        self.environment = current_app.config.get('MPESA_ENVIRONMENT') or os.getenv('MPESA_ENVIRONMENT', 'sandbox')
        self.callback_url = current_app.config.get('MPESA_CALLBACK_URL') or os.getenv('MPESA_CALLBACK_URL', '')
        
        # Set base URL based on environment
        self.base_url = self.SANDBOX_BASE_URL if self.environment == 'sandbox' else self.PRODUCTION_BASE_URL
    
    def _get_access_token(self):
        """
        Generate OAuth access token for Daraja API.
        
        Returns:
            str: Access token for subsequent API calls
        """
        try:
            # Create authorization header
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
                return token_data.get('access_token')
            else:
                current_app.logger.error(f"Failed to get access token: {response.text}")
                return None
                
        except Exception as e:
            current_app.logger.error(f"Error getting access token: {str(e)}")
            return None
    
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

