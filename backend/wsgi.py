"""
WSGI entry point for Vercel deployment
"""
from app import create_app

# Create the Flask app instance
app = create_app()

# Vercel will use this 'app' object
