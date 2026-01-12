"""
Protected Routes - Admin and Field Agent routes.

These routes demonstrate how @role_required decorator works.
Includes dashboard stats, user management, and verification endpoints.
"""

from flask import Blueprint, jsonify
from decorators.role_decorator import role_required
from models import db, User, Supplier
from models.role import Role


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
                'active_field_agents': field_agents,  # Can be enhanced with last_activity check
                'active_suppliers': total_suppliers   # Can be enhanced with active status
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