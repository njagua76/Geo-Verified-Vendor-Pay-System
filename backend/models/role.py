"""
Role Model - Defines user roles in the system.

Roles control access permissions:
- Admin: Full access (manage suppliers, view logs)
- Field Agent: Can verify locations and trigger payments
"""
from models import db

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key = True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)

    # ═══════════════════════════════════════════════════════════
    # RELATIONSHIPS
    # ═══════════════════════════════════════════════════════════
    
    # Relationship to User model
    # This creates a virtual property: role.users
    # backref='role': Users will have user.role property
    # lazy=True: Don't load users until accessed (saves memory)
    users = db.relationship('User', backref='role', lazy=True)

    #repr for debugging
    def __repr__(self):
        """String representation for debugging."""
        return f"<Role({self.role_name}')>"
    
    def to_dict(self):
        """Convert role to dictionary for JSON serialization (key value pairs)"""
        return {
            'id': self.id,
            'role_name': self.role_name
        }