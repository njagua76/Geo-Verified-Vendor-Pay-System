"""
Authentication Service - Login logic and JWT token generation.

This service handles:
1. User credential verification
2. JWT token creation and encoding
3. Authentication business logic
"""

import jwt
from datetime import datetime, timezone
from models import db
from models.user import User
from config import Config

class AuthService:
    """Service class for authentication operations"""

    @staticmethod
    def authenticate_user(email,password):
        """Verify user credentials and return if user is valid"""
        # Query database for user with this email
        #.first() returns first match or None if not found
        user = User.query.filter_by(email=email).first()

        #Check if user exists AND password is correct
        #If user is None no need to call for check_password()
        if user and user.check_password(password):
            return user
        #if user doesn't exist or password is incorrect return None for both cases
        return None
    
    @staticmethod
    def generate_token(user):
        """Generate a JWT token for an authenticated user"""
        """
        JWT has 3 segments:
        1. Header: Metadata about the token (algorithm, type)
        2. Payload: Claims/data (user ID, role, expiration)
        3. Signature: Ensures token integrity (signed with secret key)        
        """
        expiration = datetime.now(timezone.utc) + Config.JWT_ACCESS_TOKEN_EXPIRES

        #Create the payload
        payload = {
            'user_id': user.id,
            'email': user.email,
            'role_name': user.role.role_name, #Access via the relationship
            'exp': expiration #JWT libraty handles timestamp conversions
        }

        #Encode the token
        #jwt.encode(payload, secrey_key, algorithm)
        #Returns a string "56eyve56yb546y..."
        token = jwt.encode{
            payload, 
            Config.JWT_SECRET_KEY,
            algorithm='HS256'
        }
        return token
    @staticmethod
    def login(email, password):
        """Complete login flow: authenticate and generate token"""

    #Step 1: Verify the credentials
        user = AuthService.authenticate_user(email,password)

        if not user:
            return None, None
        
        token = AuthService.generate_token(user)
        return token, user