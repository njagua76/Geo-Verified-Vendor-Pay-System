from datetime import datetime
from .. import db  # import the db from __init__.py

class TransactionLog(db.Model):
    __tablename__ = "transactions_log"

    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, nullable=False)
    agent_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    distance_meters = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


