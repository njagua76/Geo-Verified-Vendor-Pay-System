"""
Supplier Routes - CRUD operations for supplier management.

Public GET endpoints are accessible to all authenticated users.
Create/Update/Delete operations are Admin-only.
"""

from flask import Blueprint, request, jsonify
from ..models import db, Supplier
from ..decorators import role_required
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