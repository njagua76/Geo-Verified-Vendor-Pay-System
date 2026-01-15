"""
M-Pesa Callback Routes - Handle payment responses from Safaricom Daraja API
"""

from flask import Blueprint, request, jsonify, current_app
from models import db, TransactionLog
from datetime import datetime

mpesa_callbacks_bp = Blueprint('mpesa_callbacks', __name__)


@mpesa_callbacks_bp.route('/b2c/result', methods=['POST'])
def b2c_result_callback():
    """
    Handle M-Pesa B2C payment result callback.
    
    This endpoint is called by Safaricom when a B2C payment completes (success or failure).
    
    Expected payload structure:
    {
        "Result": {
            "ResultType": 0,
            "ResultCode": 0,
            "ResultDesc": "The service request is processed successfully.",
            "OriginatorConversationID": "xxxx-xxxx-xxxx",
            "ConversationID": "AG_xxxxxxxxx",
            "TransactionID": "NLJ7RT61SV",
            "ResultParameters": {
                "ResultParameter": [
                    {"Key": "TransactionAmount", "Value": 100},
                    {"Key": "TransactionReceipt", "Value": "NLJ7RT61SV"},
                    {"Key": "B2CRecipientIsRegisteredCustomer", "Value": "Y"},
                    ...
                ]
            }
        }
    }
    """
    try:
        callback_data = request.get_json()
        current_app.logger.info(f"📥 B2C Result Callback received: {callback_data}")
        
        # Extract result information
        result = callback_data.get('Result', {})
        result_code = result.get('ResultCode')
        result_desc = result.get('ResultDesc')
        conversation_id = result.get('ConversationID')
        originator_conversation_id = result.get('OriginatorConversationID')
        transaction_id = result.get('TransactionID')
        
        # Find the transaction in our database
        transaction = TransactionLog.query.filter_by(
            mpesa_checkout_id=conversation_id
        ).first()
        
        if not transaction:
            current_app.logger.warning(f"⚠️  Transaction not found for Conversation ID: {conversation_id}")
            # Still acknowledge receipt to M-Pesa
            return jsonify({
                "ResultCode": 0,
                "ResultDesc": "Accepted"
            }), 200
        
        # Process based on result code
        if result_code == 0:
            # SUCCESS
            current_app.logger.info(f"✅ B2C Payment successful! Transaction ID: {transaction_id}")
            
            # Extract transaction details from result parameters
            result_parameters = result.get('ResultParameters', {}).get('ResultParameter', [])
            receipt_number = None
            amount = None
            
            for param in result_parameters:
                key = param.get('Key')
                value = param.get('Value')
                
                if key == 'TransactionReceipt':
                    receipt_number = value
                elif key == 'TransactionAmount':
                    amount = value
            
            # Update transaction
            transaction.status = 'PAYMENT_SUCCESS'
            transaction.mpesa_receipt_number = receipt_number or transaction_id
            transaction.result_description = result_desc
            transaction.transaction_date = datetime.utcnow()
            
        else:
            # FAILURE
            current_app.logger.error(f"❌ B2C Payment failed! Result Code: {result_code}, Description: {result_desc}")
            
            transaction.status = 'PAYMENT_FAILED'
            transaction.result_description = result_desc
        
        db.session.commit()
        current_app.logger.info(f"💾 Transaction updated: ID={transaction.id}, Status={transaction.status}")
        
        # Acknowledge receipt to M-Pesa
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Error processing B2C result callback: {str(e)}")
        # Still acknowledge to prevent retries
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200


@mpesa_callbacks_bp.route('/b2c/timeout', methods=['POST'])
def b2c_timeout_callback():
    """
    Handle M-Pesa B2C payment timeout callback.
    
    This endpoint is called by Safaricom when a B2C payment request times out.
    """
    try:
        callback_data = request.get_json()
        current_app.logger.warning(f"⏱️  B2C Timeout Callback received: {callback_data}")
        
        # Extract timeout information
        result = callback_data.get('Result', {})
        conversation_id = result.get('ConversationID')
        result_desc = result.get('ResultDesc', 'Payment request timed out')
        
        # Find and update the transaction
        transaction = TransactionLog.query.filter_by(
            mpesa_checkout_id=conversation_id
        ).first()
        
        if transaction:
            transaction.status = 'PAYMENT_TIMEOUT'
            transaction.result_description = result_desc
            db.session.commit()
            current_app.logger.info(f"💾 Transaction marked as timeout: ID={transaction.id}")
        
        # Acknowledge receipt
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Error processing B2C timeout callback: {str(e)}")
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200


@mpesa_callbacks_bp.route('/test-callback', methods=['POST'])
def test_callback():
    """
    Test endpoint to simulate M-Pesa callbacks during development.
    
    Send a POST request with sample callback data to test your callback handling.
    """
    try:
        data = request.get_json()
        current_app.logger.info(f"🧪 Test callback received: {data}")
        
        return jsonify({
            "message": "Test callback received",
            "data": data
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
