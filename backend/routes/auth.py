from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from validators.input_validator import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    # Flask-CORS handles OPTIONS preflight requests automatically
    # No manual handling needed - this ensures proper 2xx status for preflight

    if not request.is_json:
        return jsonify({
            'error': 'Content type must be application/json'
        }), 400

    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'Invalid JSON'
        }), 400

    email = data.get('email')
    password = data.get('password')

    errors = {}

    is_valid, error_msg = validate_email(email)
    if not is_valid:
        errors['email'] = error_msg

    is_valid, error_msg = validate_password(password)
    if not is_valid:
        errors['password'] = error_msg

    if errors:
        return jsonify({'errors': errors}), 400

    try:
        token, user = AuthService.login(email, password)

        if not token:
            return jsonify({
                'error': 'Invalid email or password'
            }), 401

        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'An error occurred during login'
        }), 500
