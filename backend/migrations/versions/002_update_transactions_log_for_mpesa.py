"""Update transactions_log table for M-Pesa integration

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 00:00:00

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '002'
down_revision = '001a'
branch_labels = None
depends_on = None

def upgrade():
    # Add M-Pesa specific columns
    op.add_column('transactions_log', sa.Column('mpesa_checkout_id', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('mpesa_receipt_number', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('phone_number', sa.String(20), nullable=True))
    op.add_column('transactions_log', sa.Column('amount', sa.Float(), nullable=True))
    op.add_column('transactions_log', sa.Column('transaction_type', sa.String(50), nullable=True))
    op.add_column('transactions_log', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('transactions_log', sa.Column('result_description', sa.Text(), nullable=True))
    op.add_column('transactions_log', sa.Column('transaction_date', sa.DateTime(), nullable=True))
    
    # Change distance_meters to nullable (for M-Pesa only transactions)
    op.alter_column('transactions_log', 'distance_meters', existing_type=sa.Float(), nullable=True)

def downgrade():
    # Remove M-Pesa specific columns
    op.drop_column('transactions_log', 'transaction_date')
    op.drop_column('transactions_log', 'result_description')
    op.drop_column('transactions_log', 'description')
    op.drop_column('transactions_log', 'transaction_type')
    op.drop_column('transactions_log', 'amount')
    op.drop_column('transactions_log', 'phone_number')
    op.drop_column('transactions_log', 'mpesa_receipt_number')
    op.drop_column('transactions_log', 'mpesa_checkout_id')
    
    # Revert distance_meters to not nullable
    op.alter_column('transactions_log', 'distance_meters', existing_type=sa.Float(), nullable=False)

