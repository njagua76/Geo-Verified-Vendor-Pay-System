"""
Script to create the transactions_log table in the database.
Run this to fix the "relation does not exist" error.
"""

import sys
import os

# Add parent directory to path for relative imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.models import db


def create_transactions_log_table():
    """Create the transactions_log table."""
    
    app = create_app()
    
    with app.app_context():
        print("🔄 Creating transactions_log table...")
        
        # Create the table using SQLAlchemy
        db.create_all()
        
        # Verify the table exists
        from backend.models import TransactionLog
        result = db.session.execute(db.text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions_log')"))
        exists = result.scalar()
        
        if exists:
            print("✅ transactions_log table created successfully!")
        else:
            print("❌ Failed to create transactions_log table")
        
        # List all tables
        result = db.session.execute(db.text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"))
        tables = [row[0] for row in result.fetchall()]
        print(f"\n📋 Current database tables: {tables}")


if __name__ == '__main__':
    create_transactions_log_table()

