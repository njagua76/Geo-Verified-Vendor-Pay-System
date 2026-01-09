"""
Protected Routes - Demo routes to test role-based authentication.

These routes demonstrate how @role_required decorator works.

Dummy data just for testing
"""

from flask import Blueprint, jsonify
from decorators.role_decorator import role_required


protected_bp = Blueprint('protected', __name__)


@protected_bp.route('/admin/dashboard', methods=['GET'])
@role_required('Admin')
def admin_dashboard(current_user):
    """
    Admin-only dashboard endpoint.
    
    Only users with 'Admin' role can access this.
    Demonstrates decorator protecting routes by role.
    """
    return jsonify({
        'message': 'Welcome to Admin Dashboard',
        'user': {
            'email': current_user['email'],
            'role': current_user['role_name'],
            'user_id': current_user['user_id']
        },
        'data': {
            'total_users': 100,
            'total_suppliers': 50,
            'total_transactions': 500
        }
    }), 200


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