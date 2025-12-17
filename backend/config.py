"""
Configuration module for the Geo-Verified Vendor Pay System
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

class Config:
    """Configuration class that loads settings from environment variables."""
    
    # ═══════════════════════════════════════════════════════════
    # DATABASE CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    
    # PostgreSQL connection string
    # Format: postgresql://username:password@host:port/database_name
    
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://geo_user:9090@localhost:5432/geo_vendor_db'
    )
    
    # Disable SQLAlchemy's event system (saves memory, we don't need it)
    # This feature tracks modifications to objects, but Flask doesn't need it
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    
    # ═══════════════════════════════════════════════════════════
    # JWT (JSON Web Token) CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    

    JWT_SECRET_KEY = os.getenv(
        'JWT_SECRET_KEY',
        'dev-secret-key-CHANGE-IN-PRODUCTION'  # Using this only for development
    )
    
    # How long before a JWT expires
    # timedelta(hours=24) = 24 hours = 1 day
    # After this time, users must log in again
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
    )
    
    
    # ═══════════════════════════════════════════════════════════
    # M-PESA DARAJA API CONFIGURATION (Using this as placeholder for now)
    # ═══════════════════════════════════════════════════════════
    
    #Place holder for now, will work on this in the future
    # Safaricom Daraja API credentials (for M-Pesa payments)
    MPESA_CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY', '')
    MPESA_CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET', '')
    
    # Business short code (your paybill/till number)
    MPESA_SHORTCODE = os.getenv('MPESA_SHORTCODE', '')
    
    # Passkey for online payments (from Daraja portal)
    MPESA_PASSKEY = os.getenv('MPESA_PASSKEY', '')
    
    # Daraja API endpoints
    # Sandbox = testing environment, Production = real money!
    MPESA_ENVIRONMENT = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
    
    
    # ═══════════════════════════════════════════════════════════
    # APPLICATION CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    
    # Flask secret key (for session cookies, CSRF tokens)
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-flask-secret-CHANGE-ME')
    

    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'

