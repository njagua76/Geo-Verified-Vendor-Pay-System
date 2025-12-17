"""
Authentication Routes - HTTP endpoints for login.

Endpoints:
- POST /login: Authenticate user and return JWT token
"""

from flask import Blueprint, request , jsonify
from services.auth_service import AuthService


#Create authentication blueprint
auth_bp = Blueprint('auth', __name__)

#define routes

@auth_bp.route('/login', methods=['POST'])
def login():
    #step 1: Validate request format make sure its json
    if not request.is_json:
        return jsonify({
            'error': 'Content type must be application/json'
        }), 400 #bad request from client
    data = request.get_json()

    if not data:
        return jsonify({
            'error': 'Invalid Json'
        }), 400 #bad request from client
    
    #step 2: Validate username and email
    #Extract email and password from request
    #.get() returns None if the key is not found
    email = data.get('email')
    password = data.get('password')
    
    #Check if both fields are present and not empty
    if not email or not password:
        return jsonify({
            'error': 'Email and password must be entered!!!'
        }), 400
    
    #step 3: Authenticate user
    try:
        #Call authentication service
        #Returns (token, user) tuple if successful is not (None, None ) if failed
        token, user = AuthService.login(email,password)

        #Check if auth failed
        if not token:
            return jsonify({
                'error': 'Invalid email or password'
            }), 401 #Unauthorised
        
        #step 4: Return token and user info
        return jsonify({
            'token': token,
            'user': user.to_dict() #convert to dictionary
        }), 200 #success
    except Exception as e:
        #Catch unexpected errors and try to address 
        #Add a debugger
        return jsonify({
            'error': 'An error occured during login',
            'details': str(e) #This verbose explnation should not be in production though
        }), 500 #Internal Server Error