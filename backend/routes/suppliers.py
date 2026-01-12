"""
Supplier Routes - CRUD operations for supplier management and M-Pesa payments.

Public GET endpoints are accessible to all authenticated users.
Create/Update/Delete operations are Admin-only.
Payment operations are Field Agent accessible.
"""

from flask import Blueprint, request, jsonify
from ..models import db, Supplier, TransactionLog
from ..decorators import role_required
from ..services.mpesa_service import initiate_payment, process_mpesa_callback
import re

suppliers_bp = Blueprint('suppliers', __name__, url_prefix='/api/suppliers')

# ===============================
# GET ALL SUPPLIERS (PUBLIC)
# ===============================

@suppliers_bp.route('', methods=['GET'])
def get_all_suppliers():
    """Get all suppliers (Public - no authentication needed)."""
    try:
        suppliers = Supplier.query.all()
        return jsonify({
            'suppliers': [supplier.to_dict() for supplier in suppliers],
            'count': len(suppliers)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===============================
# CREATE SUPPLIER
# ===============================

@suppliers_bp.route('', methods=['POST'])
@role_required('Admin')
def create_supplier():
    """Create a new supplier (Admin only)."""
    try:
        data = request.get_json()
        
        # Required fields validation
        required_fields = ['name', 'supplier_id', 'latitude', 'longitude', 'mpesa_phone_number']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing': missing_fields
            }), 400
        
        # Validate latitude/longitude
        if not (-90 <= data['latitude'] <= 90):
            return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
        
        if not (-180 <= data['longitude'] <= 180):
            return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
        
        # Validate M-Pesa phone number format (Kenyan)
        phone = data['mpesa_phone_number']
        phone_pattern = r'^(\+254|0)[17]\d{8}$'
        if not re.match(phone_pattern, phone):
            return jsonify({
                'error': 'Invalid Kenyan phone number format',
                'expected_format': '+254XXXXXXXXX or 0XXXXXXXXX'
            }), 400
        
        # Check for duplicate supplier_id
        existing = Supplier.query.filter_by(supplier_id=data['supplier_id']).first()
        if existing:
            return jsonify({'error': 'Supplier ID already exists'}), 409
        
        # Create new supplier
        supplier = Supplier(
            name=data['name'],
            supplier_id=data['supplier_id'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            mpesa_phone_number=data['mpesa_phone_number'],
            contact_person=data.get('contact_person'),
            contact_email=data.get('contact_email'),
            address=data.get('address')
        )
        
        db.session.add(supplier)
        db.session.commit()
        
        return jsonify({
            'message': 'Supplier created successfully',
            'supplier': supplier.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===============================
# GET SINGLE SUPPLIER (PUBLIC)
# ===============================

@suppliers_bp.route('/<int:supplier_id>', methods=['GET'])
def get_supplier_public(supplier_id):
    """Get a single supplier by ID (Public - no authentication needed)."""
    try:
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        
        return jsonify({'supplier': supplier.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===============================
# UPDATE SUPPLIER
# ===============================

@suppliers_bp.route('/<int:supplier_id>', methods=['PUT'])
@role_required('Admin')
def update_supplier(supplier_id):
    """Update a supplier (Admin only)."""
    try:
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            supplier.name = data['name']
        if 'latitude' in data:
            supplier.latitude = data['latitude']
        if 'longitude' in data:
            supplier.longitude = data['longitude']
        if 'mpesa_phone_number' in data:
            supplier.mpesa_phone_number = data['mpesa_phone_number']
        if 'contact_person' in data:
            supplier.contact_person = data['contact_person']
        if 'contact_email' in data:
            supplier.contact_email = data['contact_email']
        if 'address' in data:
            supplier.address = data['address']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Supplier updated successfully',
            'supplier': supplier.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===============================
# DELETE SUPPLIER
# ===============================

@suppliers_bp.route('/<int:supplier_id>', methods=['DELETE'])
@role_required('Admin')
def delete_supplier(supplier_id):
    """Delete a supplier (Admin only)."""
    try:
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        
        db.session.delete(supplier)
        db.session.commit()
        
        return jsonify({'message': 'Supplier deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===============================
# INITIATE M-PESA PAYMENT
# ===============================

@suppliers_bp.route('/payment', methods=['POST'])
@role_required('Field Agent')
def initiate_mpesa_payment(current_user):
    """
    Initiate M-Pesa STK Push payment for a supplier.
    
    Request Body:
        supplier_id (int): ID of the supplier to pay
        amount (float): Payment amount in KES
        phone_number (str): Customer's phone number (optional, uses supplier's number if not provided)
        description (str): Payment description (optional)
    
    Returns:
        dict: Payment initiation result with checkout request ID
    """
    try:
        data = request.get_json()
        
        # Required fields
        if 'supplier_id' not in data or 'amount' not in data:
            return jsonify({
                'error': 'Missing required fields',
                'required': ['supplier_id', 'amount']
            }), 400
        
        supplier_id = data['supplier_id']
        amount = data['amount']
        
        # Validate amount
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Get supplier
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        
        # Get phone number (use supplier's M-Pesa number or provided number)
        phone_number = data.get('phone_number', supplier.mpesa_phone_number)
        
        # Validate phone number format
        phone_pattern = r'^(\+254|0)[17]\d{8}$'
        if not re.match(phone_pattern, phone_number):
            return jsonify({
                'error': 'Invalid Kenyan phone number format',
                'expected_format': '+254XXXXXXXXX or 0XXXXXXXXX'
            }), 400
        
        # Normalize phone number to 254XXXXXXXXX format
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif phone_number.startswith('+'):
            phone_number = phone_number[1:]
        
        description = data.get('description', f'Payment to {supplier.name}')
        
        # Get agent ID from current user
        agent_id = current_user.get('user_id', 0)
        
        # Initiate payment
        result = initiate_payment(
            phone_number=phone_number,
            amount=amount,
            supplier_id=supplier_id,
            agent_id=agent_id,
            description=description
        )
        
        if result.get('success'):
            return jsonify({
                'message': 'Payment initiated successfully',
                'checkout_request_id': result.get('checkout_request_id'),
                'transaction_id': result.get('transaction_id'),
                'merchant_request_id': result.get('transaction_id'),
                'supplier_name': supplier.name,
                'amount': amount,
                'phone_number': phone_number
            }), 200
        else:
            return jsonify({
                'error': result.get('error', 'Payment initiation failed'),
                'message': 'Failed to initiate payment'
            }), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===============================
# M-PESA CALLBACK HANDLER
# ===============================

@suppliers_bp.route('/payment/callback', methods=['POST'])
def mpesa_callback():
    """
    Handle M-Pesa payment callback.
    
    This endpoint is called by M-Pesa after STK Push payment.
    It's a webhook endpoint (no authentication required).
    """
    try:
        callback_data = request.get_json()
        
        if not callback_data:
            return jsonify({'message': 'Callback data received'}), 200
        
        result = process_mpesa_callback(callback_data)
        
        if result.get('success'):
            return jsonify({
                'ResultCode': 0,
                'ResultDesc': 'Callback processed successfully'
            }), 200
        else:
            return jsonify({
                'ResultCode': 1,
                'ResultDesc': result.get('error', 'Processing failed')
            }), 200
            
    except Exception as e:
        return jsonify({
            'ResultCode': 1,
            'ResultDesc': str(e)
        }), 200

# ===============================
# GET PAYMENT STATUS
# ===============================

@suppliers_bp.route('/payment/status/<checkout_request_id>', methods=['GET'])
@role_required('Field Agent')
def get_payment_status(current_user, checkout_request_id):
    """
    Get the status of a payment by checkout request ID.
    
    Args:
        checkout_request_id (str): The M-Pesa checkout request ID
        
    Returns:
        dict: Transaction status information
    """
    try:
        transaction = TransactionLog.query.filter_by(
            mpesa_checkout_id=checkout_request_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        return jsonify({
            'transaction': transaction.to_dict(),
            'status': transaction.status,
            'message': transaction.result_description
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===============================
# GET TRANSACTION LOGS
# ===============================

@suppliers_bp.route('/transactions', methods=['GET'])
@role_required('Field Agent')
def get_transactions(current_user):
    """
    Get transaction logs for the authenticated field agent.
    
    Query Parameters:
        supplier_id (int): Filter by supplier ID (optional)
        status (str): Filter by status (pending, success, failed) (optional)
        limit (int): Maximum number of records to return (default: 50)
        offset (int): Number of records to skip (default: 0)
    
    Returns:
        dict: List of transactions
    """
    try:
        agent_id = current_user.get('user_id', 0)
        supplier_id = request.args.get('supplier_id', type=int)
        status = request.args.get('status')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Build query
        query = TransactionLog.query.filter_by(agent_id=agent_id)
        
        if supplier_id:
            query = query.filter_by(supplier_id=supplier_id)
        
        if status:
            query = query.filter_by(status=status)
        
        # Get total count
        total_count = query.count()
        
        # Get transactions with pagination
        transactions = query.order_by(
            TransactionLog.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        return jsonify({
            'transactions': [tx.to_dict() for tx in transactions],
            'total': total_count,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

