from flask import Blueprint, jsonify, request
from ..decorators.role_required import role_required
from ..models.transaction_log import TransactionLog
from ..models.supplier import Supplier
from ..models.user import User
from ..models.role import Role
from .. import db

admin_bp = Blueprint("admin_bp", __name__)


@admin_bp.route("/dashboard", methods=["GET"])
@role_required("Admin")
def get_dashboard_stats():
    """
    Get dashboard statistics for admin.
    Returns total users, suppliers, and transactions counts.
    """
    try:
        total_users = User.query.count()
        total_suppliers = Supplier.query.count()
        total_transactions = TransactionLog.query.count()
        
        # Get recent transactions count
        recent_transactions = TransactionLog.query.filter(
            TransactionLog.created_at >= db.func.date_sub(
                db.func.now(), db.text("INTERVAL 7 DAY")
            )
        ).count()
        
        # Get transactions by status
        success_count = TransactionLog.query.filter_by(status='success').count()
        pending_count = TransactionLog.query.filter_by(status='pending').count()
        failed_count = TransactionLog.query.filter_by(status='failed').count()
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_suppliers': total_suppliers,
                'total_transactions': total_transactions,
                'recent_transactions': recent_transactions,
                'success_count': success_count,
                'pending_count': pending_count,
                'failed_count': failed_count
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route("/transactions", methods=["GET"])
@role_required("Admin")
def get_all_transactions():
    """
    Get all transactions for admin dashboard.
    Supports filtering by status, supplier, date range, and pagination.
    """
    try:
        # Get query parameters for filtering and pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('limit', 20, type=int)
        status = request.args.get('status')
        supplier_id = request.args.get('supplier_id', type=int)
        agent_id = request.args.get('agent_id', type=int)
        search = request.args.get('search')
        
        # Build query
        query = TransactionLog.query
        
        # Apply filters
        if status:
            query = query.filter(TransactionLog.status == status)
        
        if supplier_id:
            query = query.filter(TransactionLog.supplier_id == supplier_id)
        
        if agent_id:
            query = query.filter(TransactionLog.agent_id == agent_id)
        
        # Get total count before pagination
        total_count = query.count()
        
        # Apply pagination
        transactions = query.order_by(
            TransactionLog.created_at.desc()
        ).offset((page - 1) * per_page).limit(per_page).all()
        
        return jsonify({
            'transactions': [tx.to_dict() for tx in transactions],
            'total': total_count,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_count + per_page - 1) // per_page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route("/transactions-log", methods=["GET"])
@role_required("Admin")
def get_transactions_log():
    """
    Get recent transaction logs (limited to 10).
    """
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
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "supplier_name": log.supplier.name if log.supplier else None,
            "agent_email": log.agent.email if log.agent else None
        }
        for log in logs
    ]), 200


@admin_bp.route("/suppliers", methods=["GET"])
@role_required("Admin")
def get_suppliers():
    """Get all suppliers for admin."""
    try:
        suppliers = Supplier.query.all()
        return jsonify({
            'suppliers': [s.to_dict() for s in suppliers],
            'count': len(suppliers)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route("/users", methods=["GET"])
@role_required("Admin")
def get_users():
    """Get all users for admin."""
    try:
        users = User.query.all()
        return jsonify({
            'users': [u.to_dict() for u in users],
            'count': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route("/transactions/<int:transaction_id>", methods=["GET"])
@role_required("Admin")
def get_transaction_detail(transaction_id):
    """Get details of a specific transaction."""
    try:
        transaction = TransactionLog.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        return jsonify({
            'transaction': transaction.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

