"""
Input Validation Module

Provides validation functions for user input to ensure:
1. Format correctness (e.g., email format)
2. Data safety (e.g., length limits)
3. Business logic compliance (e.g., coordinate ranges)

All validation functions return: (is_valid: bool, error_message: str)
"""

import re

def validate_email(email):
    """Validate email format using regex"""

    #Check if email is blank
    if not email:
        return False, "Email is required"
    
    #remove white space from email
    email = email.strip()

    #Secure against large inputs
    if len(email) > 254:
        return False, "Email is too long(max 254 characters allowed)"
    
    email_pattern =  r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    
    return True, ""


def validate_password(password):
    """Check users password is present and length is correct"""
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    #Check if password length is not too long
    if len(password) > 120:
        return False, "Password is too long(max 120 characters allowed)"
    
    return True, ""

def validate_latitude(latitude):
    """
    Validate latitude coordinate
    Longitude must be between -180 and +180 degrees.
    Accepts both numbers and numeric strings.   
    
    """
    #Check if value exists
    if latitude is None or latitude == "":
        return False, "Latitude is required", None
    
    try:
        lat = float(latitude)
    except(ValueError, TypeError):
        return False, "Latitude must be a number"
    
    if lat < -90 or lat > 90:
        return False, "Latitude must be between -90 and 90 degrees", None
    
    #All checks passed
    return True, "", lat

def validate_longitude(longitude):
    """Validate longitude coordinate"""
    #Check if the value exists
    if longitude is None or longitude == "":
        return False, "Logitude is required", None
    
    try:
        lon = float(longitude):
    except(ValueError, TypeError):
        return False, "Logitude must ba a valid number", None
    
    #step3: Check range (-100 to +180)
    if lon < -180 or lon > 180:
        return False, "Logitude must be between -180 and 180 degrees", None
    
    return True, "", lon
    