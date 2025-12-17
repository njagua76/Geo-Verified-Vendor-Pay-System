"""
Role-Based Authentication Decorator - Custom Flask decorator for route protection.

Provides:
- @role_required(role_name): Protects routes by user role
"""

from functools import wraps
from flask import jsonify
from utils.jwt_utils import verify_token


def role_required(required_role):
    """
    Decorator factory that creates a decorator to protect routes by role.
    
    This is a decorator WITH arguments, so it has 3 layers:
    1. role_required(required_role) - Accepts the role argument
    2. decorator(f) - Accepts the function to wrap
    3. wrapper(*args, **kwargs) - Executes when route is called
    
    Args:
        required_role (str): The role name required to access the route
                           Examples: 'Admin', 'Field Agent'
    
    Returns:
        function: A decorator function that wraps route functions
        
    Usage:
        @role_required('Admin')
        def get_admin_dashboard():
            return "Admin data"
            
        @role_required('Field Agent')
        def verify_location():
            return "Location verified"
    
    Flow:
        Request → Extract token → Verify token → Check role → Allow/Deny
    """
    
    # Layer 2: This function receives the route function to wrap
    def decorator(f):
        """
        The actual decorator that wraps the route function.
        
        Args:
            f: The route function to protect
            
        Returns:
            function: Wrapped function with auth checks
        """
        
        # Layer 3: This wrapper executes when the route is called
        @wraps(f)  # Preserves original function's metadata
        def wrapper(*args, **kwargs):
            """
            Wrapper function that runs before the actual route.
            
            This function:
            1. Extracts JWT token from Authorization header
            2. Verifies token signature and expiration
            3. Checks if user's role matches required_role
            4. Either allows access or returns error
            
            Args:
                *args: Positional arguments passed to route
                **kwargs: Keyword arguments passed to route
                
            Returns:
                Response from original function OR error response
            """
            
            # Step 1: Verify JWT Token
            payload = verify_token()
            
            if not payload:
                return jsonify({
                    'error': 'Authentication required',
                    'message': 'Valid JWT token required in Authorization header'
                }), 401
            
            # Step 2: Check User Role
            user_role = payload.get('role_name')
            
            if user_role != required_role:
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'Access denied. Required role: {required_role}',
                    'your_role': user_role
                }), 403
            
            # Step 3: User Authorized - Execute Route Function
            kwargs['current_user'] = payload
            
            return f(*args, **kwargs)
        
        # Return the wrapper function
        return wrapper
    
    # Return the decorator function
    return decorator