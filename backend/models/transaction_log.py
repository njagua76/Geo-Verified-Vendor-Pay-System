from datetime import datetime
from . import db  


class TransactionLog(db.Model):
    """
    Stores M-Pesa B2C payment transactions only.
    All Safaricom/M-Pesa response fields are captured here.
    """
    __tablename__ = "transactions_log"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # M-Pesa B2C Request Fields
    phone_number = db.Column(db.String(20), nullable=False)  # Recipient phone (254XXXXXXXXX)
    amount = db.Column(db.Float, nullable=False)  # Payment amount in KES
    
    # M-Pesa Response Fields
    conversation_id = db.Column(db.String(100), nullable=True)  # ConversationID from Safaricom
    originator_conversation_id = db.Column(db.String(100), nullable=True)  # OriginatorConversationID
    response_code = db.Column(db.String(10), nullable=True)  # ResponseCode (0 = success)
    response_description = db.Column(db.Text, nullable=True)  # ResponseDescription
    
    # M-Pesa Callback Fields (updated when callback received)
    result_type = db.Column(db.Integer, nullable=True)  # 0 = success, non-zero = failure
    result_code = db.Column(db.String(10), nullable=True)  # Result code from callback
    result_description = db.Column(db.Text, nullable=True)  # Result description from callback
    transaction_id = db.Column(db.String(100), nullable=True)  # M-Pesa transaction ID/receipt
    transaction_receipt = db.Column(db.String(100), nullable=True)  # Receipt number
    transaction_completed_datetime = db.Column(db.DateTime, nullable=True)  # When M-Pesa completed
    receiver_party_public_name = db.Column(db.String(200), nullable=True)  # Recipient name
    b2c_working_account_available_funds = db.Column(db.Float, nullable=True)  # Remaining balance
    b2c_utility_account_available_funds = db.Column(db.Float, nullable=True)  # Utility balance
    b2c_charges_paid_account_available_funds = db.Column(db.Float, nullable=True)  # Charges balance
    
    # Status tracking
    status = db.Column(db.String(50), nullable=False)  # PENDING, PAYMENT_SENT, COMPLETED, FAILED
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # When request was made
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    remarks = db.Column(db.Text, nullable=True)  # Payment remarks/description

    # Relationships
    supplier = db.relationship('Supplier', backref='mpesa_transactions')
    agent = db.relationship('User', backref='mpesa_transactions')

    def to_dict(self):
        """Convert transaction log to dictionary."""
        return {
            'id': self.id,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name if self.supplier else None,
            'agent_id': self.agent_id,
            'agent_email': self.agent.email if self.agent else None,
            'phone_number': self.phone_number,
            'amount': self.amount,
            'conversation_id': self.conversation_id,
            'originator_conversation_id': self.originator_conversation_id,
            'response_code': self.response_code,
            'response_description': self.response_description,
            'result_type': self.result_type,
            'result_code': self.result_code,
            'result_description': self.result_description,
            'transaction_id': self.transaction_id,
            'transaction_receipt': self.transaction_receipt,
            'transaction_completed_datetime': self.transaction_completed_datetime.isoformat() if self.transaction_completed_datetime else None,
            'receiver_party_public_name': self.receiver_party_public_name,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'remarks': self.remarks
        }


