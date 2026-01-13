"""Create transactions_log table

Revision ID: 001a
Revises: 001_add_suppliers_table
Create Date: 2024-01-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = '001a'
down_revision = '001_add_suppliers_table'
branch_labels = None
depends_on = None

def upgrade():
    # Create the transactions_log table
    op.create_table('transactions_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=False),
        sa.Column('agent_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('distance_meters', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        # M-Pesa specific fields
        sa.Column('mpesa_checkout_id', sa.String(100), nullable=True),
        sa.Column('mpesa_receipt_number', sa.String(100), nullable=True),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('transaction_type', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('result_description', sa.Text(), nullable=True),
        sa.Column('transaction_date', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for faster queries
    op.create_index('ix_transactions_log_supplier_id', 'transactions_log', ['supplier_id'])
    op.create_index('ix_transactions_log_agent_id', 'transactions_log', ['agent_id'])
    op.create_index('ix_transactions_log_created_at', 'transactions_log', ['created_at'])

def downgrade():
    op.drop_index('ix_transactions_log_created_at', table_name='transactions_log')
    op.drop_index('ix_transactions_log_agent_id', table_name='transactions_log')
    op.drop_index('ix_transactions_log_supplier_id', table_name='transactions_log')
    op.drop_table('transactions_log')

