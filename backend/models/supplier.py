"""
Supplier Model - Stores vendor/supplier information.
"""

from datetime import datetime
from . import db  

class Supplier(db.Model):
    """Supplier database model"""
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    supplier_id = db.Column(db.String(50), unique=True, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    mpesa_phone_number = db.Column(db.String(20), nullable=False)
    contact_person = db.Column(db.String(100))
    contact_email = db.Column(db.String(100))
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Supplier {self.name} ({self.supplier_id})>'
    
    def to_dict(self):
        """Convert supplier to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'supplier_id': self.supplier_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location': self.address or 'Unknown Location',
            'mpesa_phone_number': self.mpesa_phone_number,
            'contact_person': self.contact_person,
            'contact_email': self.contact_email,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }