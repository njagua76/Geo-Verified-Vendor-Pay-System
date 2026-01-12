from functools import wraps
from flask import request, jsonify
import jwt
import os

def role_required(required_role):
    """
    Decorator to protect routes based on the user's role stored in JWT.
    Usage: @role_required('Administrator')
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({"error": "Authorization header missing"}), 401

            try:
                token = auth_header.split(" ")[1]
                decoded = jwt.decode(token, os.environ.get("JWT_SECRET"), algorithms=["HS256"])
                user_role = decoded.get("role_name")

                if user_role != required_role:
                    return jsonify({"error": "Forbidden: insufficient role"}), 403

            except IndexError:
                return jsonify({"error": "Token not provided"}), 401
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401

            return f(*args, **kwargs)
        return wrapper
    return decorator


