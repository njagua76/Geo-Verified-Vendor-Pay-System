"""
Configuration module for the Geo-Verified Vendor Pay System
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuration class that loads settings from environment variables."""
    
    # ═══════════════════════════════════════════════════════════
    # ENVIRONMENT DETECTION (Define first for use elsewhere)
    # ═══════════════════════════════════════════════════════════
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # ═══════════════════════════════════════════════════════════
    # DATABASE CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    
    # PostgreSQL connection string
    # Format: postgresql://username:password@host:port/database_name
    
    # Use SQLite for local development if PostgreSQL is not available
    # For production, use the DATABASE_URL environment variable
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        SQLALCHEMY_DATABASE_URI = database_url
    else:
        # SQLite for development (file-based, no server needed)
        import os
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'geo_vendor.db')
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path}'
    
    # Disable SQLAlchemy's event system (saves memory, we don't need it)
    # This feature tracks modifications to objects, but Flask doesn't need it
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    
    # ═══════════════════════════════════════════════════════════
    # JWT (JSON Web Token) CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    

    JWT_SECRET_KEY = os.getenv(
        'JWT_SECRET_KEY',
        'dev-secret-key-CHANGE-IN-PRODUCTION'  # MUST be set in production via .env
    )
    
    # Alert if using development secret in production
    if DEBUG and JWT_SECRET_KEY == 'dev-secret-key-CHANGE-IN-PRODUCTION':
        print("⚠️  WARNING: Using development JWT secret key. Set JWT_SECRET_KEY in .env for production.")
    
    # How long before a JWT expires
    # timedelta(hours=24) = 24 hours = 1 day
    # After this time, users must log in again
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
    )
    
    
    # ═══════════════════════════════════════════════════════════
    # M-PESA DARAJA API CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    
    # Daraja API credentials (for OAuth token generation)
    MPESA_CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY', '')
    MPESA_CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET', '')
    
    # M-Pesa Environment (sandbox = testing, production = real money)
    MPESA_ENVIRONMENT = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
    
    # Business short code (your paybill/till number)
    # For B2C in sandbox, use 600998 (test shortcode)
    MPESA_SHORTCODE = os.getenv('MPESA_SHORTCODE', '600998')
    
    # For B2C Payments (Business to Customer)
    # Initiator name - the API operator username
    MPESA_INITIATOR_NAME = os.getenv('MPESA_INITIATOR_NAME', 'testapi')
    
    # Security Credential - encrypted password for B2C operations
    # In sandbox: use 'Safaricom999!*!' (test credential)
    # In production: encrypt your initiator password using Safaricom's certificate
    MPESA_SECURITY_CREDENTIAL = os.getenv('MPESA_SECURITY_CREDENTIAL', 'Safaricom999!*!')
    
    # Callback URLs for B2C payment results
    MPESA_B2C_QUEUE_TIMEOUT_URL = os.getenv('MPESA_B2C_QUEUE_TIMEOUT_URL', '')
    MPESA_B2C_RESULT_URL = os.getenv('MPESA_B2C_RESULT_URL', '')
    
    # Default payment amount for successful location verification (in KES)
    PAYMENT_AMOUNT = float(os.getenv('PAYMENT_AMOUNT', '100'))
    
    # Legacy STK Push settings (keeping for reference, not used in B2C)
    MPESA_PASSKEY = os.getenv('MPESA_PASSKEY', '')
    MPESA_CALLBACK_URL = os.getenv('MPESA_CALLBACK_URL', '')
    
    
    # ═══════════════════════════════════════════════════════════
    # APPLICATION CONFIGURATION
    # ═══════════════════════════════════════════════════════════
    
    # Flask secret key (for session cookies, CSRF tokens)
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-flask-secret-CHANGE-ME')
    
    # CORS origins
    ALLOWED_ORIGINS = os.getenv(
        'ALLOWED_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://127.0.0.1:5000'
    ).split(',')
    
    # Validation for production
    if not DEBUG and JWT_SECRET_KEY == 'dev-secret-key-CHANGE-IN-PRODUCTION':
        raise ValueError(
            "❌ FATAL: JWT_SECRET_KEY must be changed from development default in production. "
            "Set JWT_SECRET_KEY in .env file."
        )

