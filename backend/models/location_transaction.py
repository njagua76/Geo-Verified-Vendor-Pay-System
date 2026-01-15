from datetime import datetime
from . import db


class LocationTransaction(db.Model):
    """
    Stores location verification attempts by field agents.
    Separate from M-Pesa transactions to keep concerns separated.
    """
    __tablename__ = "location_transactions"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Location data
    agent_latitude = db.Column(db.Float, nullable=False)
    agent_longitude = db.Column(db.Float, nullable=False)
    supplier_latitude = db.Column(db.Float, nullable=False)
    supplier_longitude = db.Column(db.Float, nullable=False)
    distance_meters = db.Column(db.Float, nullable=False)
    
    # Verification result
    status = db.Column(db.String(50), nullable=False)  # VERIFIED, FAILED, OUT_OF_RANGE
    threshold_meters = db.Column(db.Float, default=20.0)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text, nullable=True)
    
    # Link to M-Pesa transaction if payment was initiated
    mpesa_transaction_id = db.Column(db.Integer, db.ForeignKey('transactions_log.id'), nullable=True)

    # Relationships
    supplier = db.relationship('Supplier', backref='location_verifications')
    agent = db.relationship('User', backref='location_verifications')
    mpesa_transaction = db.relationship('TransactionLog', backref='location_verification', foreign_keys=[mpesa_transaction_id])

    def to_dict(self):
        """Convert location transaction to dictionary."""
        return {
            'id': self.id,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'agent_id': self.agent_id,
            'agent_email': self.agent.email if self.agent else None,
            'agent_latitude': self.agent_latitude,
            'agent_longitude': self.agent_longitude,
            'supplier_latitude': self.supplier_latitude,
            'supplier_longitude': self.supplier_longitude,
            'distance_meters': round(self.distance_meters, 2),
            'status': self.status,
            'threshold_meters': self.threshold_meters,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'description': self.description,
            'mpesa_transaction_id': self.mpesa_transaction_id
        }
