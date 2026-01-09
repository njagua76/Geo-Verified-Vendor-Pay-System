"""
User Model - User accounts with secure password storage.

Handles authentication data for all users (Admins and Field Agents).
"""

from models import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """User database model"""
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)


    def set_password(self, password):
        """
        Hash a password and store it.
        
        Args:
            password (str): Plain text password from user
            
        How it works:
            1. Generates random salt
            2. Combines password + salt
            3. Runs through PBKDF2-SHA256 600,000 times
            4. Stores result in password_hash column            
        
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        """String representation for debugging."""
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization (key value pairs)"""
        return {
            'id': self.id,
            'email': self.email,
            'role_name': self.role.role_name  # Access via relationship
        }