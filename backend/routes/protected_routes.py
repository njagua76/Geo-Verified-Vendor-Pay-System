"""
Protected Routes - Admin and Field Agent routes.

These routes demonstrate how @role_required decorator works.
Includes dashboard stats, user management, and verification endpoints.
"""

from flask import Blueprint, jsonify, request
from ..decorators.role_decorator import role_required
from ..models import db, User, Supplier, TransactionLog
from ..models.role import Role
from math import radians, sin, cos, sqrt, atan2


protected_bp = Blueprint('protected', __name__)


@protected_bp.route('/admin/dashboard', methods=['GET'])
@role_required('Admin')
def admin_dashboard(current_user):
    """
    Admin-only dashboard endpoint.

    Returns comprehensive dashboard statistics for admin users.
    Only users with 'Admin' role can access this.
    """
    try:
        # Get user statistics
        field_agent_role = Role.query.filter_by(role_name='Field Agent').first()
        admin_role = Role.query.filter_by(role_name='Admin').first()

        total_users = User.query.count()
        field_agents = User.query.filter_by(role_id=field_agent_role.id).count() if field_agent_role else 0
        admins = User.query.filter_by(role_id=admin_role.id).count() if admin_role else 0
        total_suppliers = Supplier.query.count()
        total_transactions = TransactionLog.query.count()

        return jsonify({
            'message': 'Welcome to Admin Dashboard',
            'user': {
                'email': current_user['email'],
                'role': current_user['role_name'],
                'user_id': current_user['user_id']
            },
            'stats': {
                'total_users': total_users,
                'total_field_agents': field_agents,
                'total_admins': admins,
                'total_suppliers': total_suppliers,
                'total_transactions': total_transactions,
                'active_field_agents': field_agents,
                'active_suppliers': total_suppliers
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@protected_bp.route('/agent/verify', methods=['GET'])
@role_required('Field Agent')
def agent_verify(current_user):
    """
    Field Agent-only verification endpoint.
    
    Only users with 'Field Agent' role can access this.
    """
    return jsonify({
        'message': 'Field Agent Verification Area',
        'user': {
            'email': current_user['email'],
            'role': current_user['role_name'],
            'user_id': current_user['user_id']
        },
        'pending_verifications': 10
    }), 200


@protected_bp.route('/profile', methods=['GET'])
@role_required('Admin')
def admin_profile(current_user):
    """
    Another admin-only route.
    
    Demonstrates multiple routes can use same decorator.
    """
    return jsonify({
        'message': 'Admin Profile',
        'profile': {
            'email': current_user['email'],
            'role': current_user['role_name'],
            'user_id': current_user['user_id']
        }
    }), 200


@protected_bp.route('/users', methods=['GET'])
@role_required('Admin')
def get_users(current_user):
    """
    Get all users in the system.
    Admin only endpoint for user management.
    
    Response:
    {
        "users": [
            {
                "id": 1,
                "email": "admin@example.com",
                "role_name": "Admin"
            },
            ...
        ],
        "count": number
    }
    """
    try:
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users],
            'count': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@protected_bp.route('/users/<role_name>', methods=['GET'])
@role_required('Admin')
def get_users_by_role(current_user, role_name):
    """
    Get users by role (e.g., Field Agent, Admin).
    
    Parameters:
        role_name: Name of the role to filter by
    
    Response:
    {
        "users": [...],
        "role": "Field Agent",
        "count": number
    }
    """
    try:
        role = Role.query.filter_by(role_name=role_name).first()
        if not role:
            return jsonify({'error': 'Role not found'}), 404
        
        users = User.query.filter_by(role_id=role.id).all()
        return jsonify({
            'users': [user.to_dict() for user in users],
            'role': role_name,
            'count': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two GPS coordinates using Haversine formula.
    
    Args:
        lat1, lon1: User's coordinates
        lat2, lon2: Supplier's coordinates
        
    Returns:
        float: Distance in meters
    """
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)
    
    a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    return R * c


@protected_bp.route('/verify-location', methods=['POST'])
@role_required('Field Agent')
def verify_location(current_user):
    """
    Verify field agent's location against supplier location.
    
    Request Body:
        user_lat (float): Field agent's latitude
        user_lon (float): Field agent's longitude
        supplier_id (int): ID of the supplier to verify against
        
    Returns:
        dict: Verification result with distance
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_lat = data.get('user_lat')
        user_lon = data.get('user_lon')
        supplier_id = data.get('supplier_id')
        
        if not all([user_lat, user_lon, supplier_id]):
            return jsonify({
                'error': 'Missing required fields',
                'required': ['user_lat', 'user_lon', 'supplier_id']
            }), 400
        
        # Get supplier
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
        
        # Calculate distance
        distance = calculate_distance(
            user_lat, user_lon,
            supplier.latitude, supplier.longitude
        )
        
        DISTANCE_THRESHOLD = 50  # 50 meters
        
        if distance <= DISTANCE_THRESHOLD:
            # Create transaction log for successful verification
            agent_id = current_user.get('user_id', 0)
            transaction = TransactionLog(
                supplier_id=supplier_id,
                agent_id=agent_id,
                status='verified',
                distance_meters=distance,
                description=f'Location verified: {round(distance)}m from supplier'
            )
            db.session.add(transaction)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': f'Location verified successfully. You are {round(distance)}m from {supplier.name}.',
                'distance': round(distance, 2),
                'supplier_name': supplier.name,
                'threshold': DISTANCE_THRESHOLD,
                'verified': True
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'You are {round(distance)}m away. You must be within {DISTANCE_THRESHOLD}m of the supplier.',
                'distance': round(distance, 2),
                'supplier_name': supplier.name,
                'threshold': DISTANCE_THRESHOLD,
                'verified': False
            }), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@protected_bp.route('/transactions-log', methods=['GET'])
@role_required('Field Agent')
def get_transaction_logs(current_user):
    """
    Get transaction logs for the authenticated field agent.
    
    Query Parameters:
        supplier_id (int): Filter by supplier ID (optional)
        status (str): Filter by status (optional)
        limit (int): Maximum number of records (default: 50)
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


@protected_bp.route('/admin/transactions', methods=['GET'])
@role_required('Admin')
def get_all_transactions(current_user):
    """
    Get all transactions in the system (Admin only).
    
    Query Parameters:
        status (str): Filter by status (pending, success, failed, verified) (optional)
        supplier_id (int): Filter by supplier ID (optional)
        limit (int): Maximum number of records (default: 100)
        offset (int): Number of records to skip (default: 0)
        
    Returns:
        dict: List of all transactions with supplier and agent details
    """
    try:
        status = request.args.get('status')
        supplier_id = request.args.get('supplier_id', type=int)
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Build query
        query = db.session.query(
            TransactionLog.id,
            TransactionLog.status,
            TransactionLog.amount,
            TransactionLog.distance_meters,
            TransactionLog.created_at,
            TransactionLog.mpesa_checkout_id,
            TransactionLog.mpesa_receipt_number,
            TransactionLog.description,
            Supplier.name.label('supplier_name'),
            User.email.label('agent_email')
        ).join(
            Supplier, TransactionLog.supplier_id == Supplier.id
        ).outerjoin(
            User, TransactionLog.agent_id == User.id
        )
        
        # Apply filters
        if status:
            query = query.filter(TransactionLog.status == status)
        
        if supplier_id:
            query = query.filter(TransactionLog.supplier_id == supplier_id)
        
        # Get total count
        total_count = query.count()
        
        # Get transactions with pagination
        transactions = query.order_by(
            TransactionLog.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        return jsonify({
            'transactions': [
                {
                    'id': tx.id,
                    'supplier_name': tx.supplier_name,
                    'agent_email': tx.agent_email,
                    'amount': tx.amount,
                    'distance_meters': tx.distance_meters,
                    'status': tx.status,
                    'created_at': tx.created_at.isoformat() if tx.created_at else None,
                    'mpesa_checkout_id': tx.mpesa_checkout_id,
                    'mpesa_receipt_number': tx.mpesa_receipt_number,
                    'description': tx.description
                }
                for tx in transactions
            ],
            'total': total_count,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

