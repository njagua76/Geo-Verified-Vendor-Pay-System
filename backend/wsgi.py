"""
WSGI entry point for Render deployment
"""
from .app import create_app

# Create the Flask app instance
app = create_app()

# Used by both Render and Vercel
