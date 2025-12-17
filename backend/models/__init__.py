"""
Models package - Database models and ORM initialization.

This file initializes SQLAlchemy and makes models easily importable.
"""

from flask_sqlalchemy import SQLAlchemy

# ═══════════════════════════════════════════════════════════
# DATABASE INSTANCE
# ═══════════════════════════════════════════════════════════

# Create SQLAlchemy instance
# This is the main database object used throughout the app
# We initialize it here but connect it to Flask in app.py
# Pass the class name to the db variable
db = SQLAlchemy()

# ═══════════════════════════════════════════════════════════
# IMPORT MODELS (after db is created)
# ═══════════════════════════════════════════════════════════

# Import models here so they're registered with SQLAlchemy
# This must happen AFTER db is created to avoid circular imports
# We'll uncomment these as we create each model file:

from models.role import Role           # User roles (Admin, Field Agent)
from models.user import User           # User accounts with passwords
# from models.supplier import Supplier   # Supplier/vendor information
# from models.transaction_log import TransactionLog  # Payment transaction records