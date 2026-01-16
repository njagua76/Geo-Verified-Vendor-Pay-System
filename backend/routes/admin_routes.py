from flask import Blueprint, jsonify, request
from decorators.role_required import role_required
from models.transaction_log import TransactionLog
from models.location_transaction import LocationTransaction
from models.supplier import Supplier
from models.user import User
from models.role import Role
from models import db

admin_bp = Blueprint("admin_bp", __name__)


@admin_bp.route("/dashboard", methods=["GET"])
@role_required("Admin")
def get_dashboard_stats(current_user):
    """
    Get dashboard statistics for admin.
    Returns total users, suppliers, and field agents counts.
    Transactions temporarily disabled pending DB migration.
    """
    try:
        total_users = User.query.count()
        total_suppliers = Supplier.query.count()
        
        # Get field agents count
        field_agent_role = Role.query.filter_by(role_name='Field Agent').first()
        total_field_agents = User.query.filter_by(role_id=field_agent_role.id).count() if field_agent_role else 0
        
        # Get admins count
        admin_role = Role.query.filter_by(role_name='Admin').first()
        total_admins = User.query.filter_by(role_id=admin_role.id).count() if admin_role else 0
        
        # Get transaction counts
        total_transactions = TransactionLog.query.count()
        success_count = TransactionLog.query.filter_by(status='COMPLETED').count()
        pending_count = TransactionLog.query.filter(
            TransactionLog.status.in_(['PENDING', 'PAYMENT_SENT'])
        ).count()
        failed_count = TransactionLog.query.filter_by(status='FAILED').count()
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_suppliers': total_suppliers,
                'total_field_agents': total_field_agents,
                'total_admins': total_admins,
                'total_transactions': total_transactions,
                'recent_transactions': total_transactions,
                'success_count': success_count,
                'pending_count': pending_count,
                'failed_count': failed_count
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route("/transactions", methods=["GET"])
@role_required("Admin")
def get_all_transactions(current_user):
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
def get_transactions_log(current_user):
    """
    Get recent M-Pesa transaction logs (simplified - just raw data from transactions_log table).
    """
    try:
        logs = (
            TransactionLog.query
            .order_by(TransactionLog.created_at.desc())
            .limit(10)
            .all()
        )

        result = []
        for log in logs:
            result.append({
                "id": log.id,
                "supplier_id": log.supplier_id,
                "supplier_name": f"Supplier {log.supplier_id}",  # Simple placeholder
                "agent_id": log.agent_id,
                "agent_email": f"agent_{log.agent_id}@example.com",  # Simple placeholder
                "status": log.status,
                "distance_meters": round(log.distance_meters, 2) if log.distance_meters else 0.0,
                "amount": float(log.amount) if log.amount else 0.0,
                "phone_number": log.phone_number,
                "conversation_id": log.conversation_id,
                "transaction_receipt": log.transaction_receipt,
                "created_at": log.created_at.isoformat() if log.created_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "transactions": []}), 500


@admin_bp.route("/suppliers", methods=["GET"])
@role_required("Admin")
def get_suppliers(current_user):
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
def get_users(current_user):
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
def get_transaction_detail(current_user, transaction_id):
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

