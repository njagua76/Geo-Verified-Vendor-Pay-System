"""
JWT Utilities - Helper functions for JWT token operations.

Provides reusable functions for:
- Extracting tokens from HTTP headers
- Decoding and verifying JWT tokens
- Handling token-related errors
"""

import jwt
from flask import request
from config import Config


def get_token_from_header():
    """Extract JWT token from Authorization Header
    just picks token from header and return none if its not found
        
    """

    #get authorization header value and return if non is found
    auth_header = request.headers.get('Authorization')

    if auth_header and auth_header.startswith('Bearer'):
        #Take the token part after Bearer
        token = auth_header.split(' ')[1]
        return token
    
    #if there is no valid response
    return None

def decode_token(token):
    """
    decode and verify a JWT token

    purpose:
    verifies the token signature to prevent tampering
    check if token has expired
    return if payload is valid
    """

    try:
        #Decode the token
        #jwt,decode() does 3 things:
        #Verify signatures using Config.JWT_SECRET_KEY
        #Check expoiration 
        #Return payload as dictionary

        payload = jwt.decode(
            token,
            Config.JWT_SECRET_KEY,
            algorithms=['HS256']
        )

        return payload
    except jwt.ExpiredSignatureError:
        #Token was valid but has expired
        #This is different from invalid token
        #User needs to log in again
        print("Your token has expired, please login again")
    
    except jwt.InvalidTokenError:
        print("Token is invalid")
        return None

def verify_token():
    """Complete token verification flow"""
    token = get_token_from_header()
    if not token:
        return None
    
    payload = decode_token(token)
    return payload