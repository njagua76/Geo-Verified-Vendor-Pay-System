"""
M-Pesa Callback Handlers

This module handles callbacks from Safaricom M-Pesa API for:
- B2C Payment Results
- B2C Queue Timeout
- STK Push callbacks (future)
"""

from flask import Blueprint, request, jsonify, current_app
from models import db, TransactionLog
from datetime import datetime
import json

mpesa_callbacks_bp = Blueprint('mpesa_callbacks', __name__, url_prefix='/api/mpesa')


@mpesa_callbacks_bp.route('/b2c/result', methods=['POST'])
def b2c_result_callback():
    """
    Handle B2C payment result callback from M-Pesa.
    
    M-Pesa calls this endpoint after processing a B2C payment request.
    The callback contains the final transaction status, receipt number,
    and other transaction details.
    
    Expected JSON structure:
    {
        "Result": {
            "ResultType": 0,
            "ResultCode": 0,
            "ResultDesc": "The service request is processed successfully.",
            "OriginatorConversationID": "29115-34620561-1",
            "ConversationID": "AG_20191219_00005797af5d7d75f652",
            "TransactionID": "NLJ7RT61SV",
            "ResultParameters": {
                "ResultParameter": [
                    {"Key": "TransactionReceipt", "Value": "NLJ7RT61SV"},
                    {"Key": "TransactionAmount", "Value": 10},
                    {"Key": "B2CWorkingAccountAvailableFunds", "Value": 900000.00},
                    {"Key": "B2CUtilityAccountAvailableFunds", "Value": 100000.00},
                    {"Key": "TransactionCompletedDateTime", "Value": "19.12.2019 11:45:50"},
                    {"Key": "ReceiverPartyPublicName", "Value": "254708374149 - John Doe"},
                    {"Key": "B2CChargesPaidAccountAvailableFunds", "Value": 0.00},
                    {"Key": "B2CRecipientIsRegisteredCustomer", "Value": "Y"}
                ]
            },
            "ReferenceData": {
                "ReferenceItem": {
                    "Key": "QueueTimeoutURL",
                    "Value": "https://..."
                }
            }
        }
    }
    """
    try:
        # Log the raw callback data for debugging
        callback_data = request.get_json()
        current_app.logger.info(f"📞 B2C Callback received: {json.dumps(callback_data, indent=2)}")
        
        # Extract the Result object
        result = callback_data.get('Result', {})
        
        # Extract key fields
        conversation_id = result.get('ConversationID')
        originator_conversation_id = result.get('OriginatorConversationID')
        result_code = result.get('ResultCode')
        result_desc = result.get('ResultDesc')
        transaction_id = result.get('TransactionID')
        
        if not conversation_id:
            current_app.logger.error("❌ No ConversationID in callback")
            return jsonify({"ResultCode": 1, "ResultDesc": "Missing ConversationID"}), 400
        
        # Find the transaction by conversation_id
        transaction = TransactionLog.query.filter_by(
            conversation_id=conversation_id
        ).first()
        
        if not transaction:
            current_app.logger.warning(f"⚠️ Transaction not found for ConversationID: {conversation_id}")
            # Still acknowledge to M-Pesa
            return jsonify({
                "ResultCode": 0,
                "ResultDesc": "Accepted (transaction not found in database)"
            }), 200
        
        # Update transaction with callback data
        transaction.result_code = str(result_code)
        transaction.result_description = result_desc
        transaction.originator_conversation_id = originator_conversation_id
        
        # Check if payment was successful
        if result_code == 0:
            transaction.status = 'COMPLETED'
            transaction.transaction_id = transaction_id
            current_app.logger.info(f"✅ Payment COMPLETED: {transaction_id}")
            
            # Extract ResultParameters
            result_parameters = result.get('ResultParameters', {}).get('ResultParameter', [])
            for param in result_parameters:
                key = param.get('Key')
                value = param.get('Value')
                
                if key == 'TransactionReceipt':
                    transaction.transaction_receipt = str(value)
                elif key == 'TransactionCompletedDateTime':
                    # Parse format: "19.12.2019 11:45:50"
                    try:
                        transaction.transaction_completed_datetime = datetime.strptime(
                            str(value), "%d.%m.%Y %H:%M:%S"
                        )
                    except Exception as e:
                        current_app.logger.warning(f"Failed to parse datetime: {e}")
                elif key == 'B2CWorkingAccountAvailableFunds':
                    transaction.b2c_working_account_available_funds = float(value)
                elif key == 'B2CUtilityAccountAvailableFunds':
                    transaction.b2c_utility_account_available_funds = float(value)
                elif key == 'ReceiverPartyPublicName':
                    transaction.receiver_party_public_name = str(value)
                elif key == 'B2CChargesPaidAccountAvailableFunds':
                    transaction.b2c_charges_paid_account_available_funds = float(value)
                elif key == 'B2CRecipientIsRegisteredCustomer':
                    transaction.b2c_recipient_is_registered_customer = str(value)
        else:
            transaction.status = 'FAILED'
            current_app.logger.error(f"❌ Payment FAILED: {result_desc} (Code: {result_code})")
        
        # Save to database
        db.session.commit()
        
        current_app.logger.info(f"💾 Transaction {transaction.id} updated: {transaction.status}")
        
        # Acknowledge receipt to M-Pesa (REQUIRED)
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ B2C callback error: {str(e)}")
        # Still return 200 to M-Pesa to avoid retries
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted (processing error)"
        }), 200


@mpesa_callbacks_bp.route('/b2c/timeout', methods=['POST'])
def b2c_timeout_callback():
    """
    Handle B2C queue timeout callback from M-Pesa.
    
    M-Pesa calls this endpoint if the payment request stays in the queue
    too long without being processed.
    """
    try:
        callback_data = request.get_json()
        current_app.logger.warning(f"⏰ B2C Timeout received: {json.dumps(callback_data, indent=2)}")
        
        # Extract conversation ID
        result = callback_data.get('Result', {})
        conversation_id = result.get('ConversationID')
        
        if conversation_id:
            transaction = TransactionLog.query.filter_by(
                conversation_id=conversation_id
            ).first()
            
            if transaction:
                transaction.status = 'TIMEOUT'
                transaction.result_description = 'Request timed out in M-Pesa queue'
                db.session.commit()
                current_app.logger.info(f"⏰ Transaction {transaction.id} marked as TIMEOUT")
        
        # Acknowledge to M-Pesa
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Timeout callback error: {str(e)}")
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200


@mpesa_callbacks_bp.route('/b2c/test', methods=['POST'])
def test_callback():
    """
    Test endpoint for simulating M-Pesa callbacks during development.
    
    Send a POST request with sample callback data to test your handler.
    """
    current_app.logger.info("🧪 Test callback endpoint called")
    # Just forward to the actual handler
    return b2c_result_callback()
