from datetime import datetime
from .. import db  # import the db from __init__.py

class TransactionLog(db.Model):
    __tablename__ = "transactions_log"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    distance_meters = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # M-Pesa specific fields
    mpesa_checkout_id = db.Column(db.String(100), nullable=True)
    mpesa_receipt_number = db.Column(db.String(100), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    amount = db.Column(db.Float, nullable=True)
    transaction_type = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    result_description = db.Column(db.Text, nullable=True)
    transaction_date = db.Column(db.DateTime, nullable=True)

    # Relationships
    supplier = db.relationship('Supplier', backref='transactions')
    agent = db.relationship('User', backref='transactions')

    def to_dict(self):
        """Convert transaction log to dictionary."""
        return {
            'id': self.id,
            'supplier_id': self.supplier_id,
            'agent_id': self.agent_id,
            'status': self.status,
            'distance_meters': self.distance_meters,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'mpesa_checkout_id': self.mpesa_checkout_id,
            'mpesa_receipt_number': self.mpesa_receipt_number,
            'phone_number': self.phone_number,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'description': self.description,
            'result_description': self.result_description,
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None,
            'supplier_name': self.supplier.name if self.supplier else None,
            'agent_email': self.agent.email if self.agent else None
        }


