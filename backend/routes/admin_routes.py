from flask import Blueprint, jsonify
from ..decorators.role_required import role_required
from ..models.transaction_log import TransactionLog

admin_bp = Blueprint("admin_bp", __name__)

@admin_bp.route("/transactions-log", methods=["GET"])
@role_required("Administrator")
def get_transactions_log():
    logs = (
        TransactionLog.query
        .order_by(TransactionLog.created_at.desc())
        .limit(10)
        .all()
    )

    return jsonify([
        {
            "id": log.id,
            "supplier_id": log.supplier_id,
            "agent_id": log.agent_id,
            "status": log.status,
            "distance_meters": log.distance_meters,
            "created_at": log.created_at.isoformat() if log.created_at else None

        }
        for log in logs
    ]), 200


