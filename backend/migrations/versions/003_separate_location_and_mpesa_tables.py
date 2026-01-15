"""Separate location verification and M-Pesa transaction tables

Revision ID: 003
Revises: 002
Create Date: 2024-01-15 00:00:00

This migration:
1. Creates location_transactions table for location verification logs
2. Updates transactions_log table to only contain M-Pesa payment data
3. Removes location-related fields from transactions_log
4. Adds all Safaricom API response fields to transactions_log
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Create location_transactions table
    op.create_table(
        'location_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=False),
        sa.Column('agent_id', sa.Integer(), nullable=False),
        sa.Column('agent_latitude', sa.Float(), nullable=False),
        sa.Column('agent_longitude', sa.Float(), nullable=False),
        sa.Column('supplier_latitude', sa.Float(), nullable=False),
        sa.Column('supplier_longitude', sa.Float(), nullable=False),
        sa.Column('distance_meters', sa.Float(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('threshold_meters', sa.Float(), nullable=False, server_default='20.0'),
        sa.Column('mpesa_transaction_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['agent_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['mpesa_transaction_id'], ['transactions_log.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_location_transactions_agent_id', 'location_transactions', ['agent_id'])
    op.create_index('ix_location_transactions_supplier_id', 'location_transactions', ['supplier_id'])
    op.create_index('ix_location_transactions_mpesa_transaction_id', 'location_transactions', ['mpesa_transaction_id'])
    
    # 2. Remove old columns from transactions_log
    op.drop_column('transactions_log', 'distance_meters')
    op.drop_column('transactions_log', 'transaction_type')
    op.drop_column('transactions_log', 'mpesa_checkout_id')
    op.drop_column('transactions_log', 'mpesa_receipt_number')
    op.drop_column('transactions_log', 'transaction_date')
    op.drop_column('transactions_log', 'description')
    
    # 3. Make phone_number and amount NOT NULL
    op.alter_column('transactions_log', 'phone_number', existing_type=sa.String(20), nullable=False)
    op.alter_column('transactions_log', 'amount', existing_type=sa.Float(), nullable=False)
    
    # 4. Add new M-Pesa Safaricom response fields
    op.add_column('transactions_log', sa.Column('conversation_id', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('originator_conversation_id', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('response_code', sa.String(10), nullable=True))
    op.add_column('transactions_log', sa.Column('response_description', sa.Text(), nullable=True))
    op.add_column('transactions_log', sa.Column('result_type', sa.Integer(), nullable=True))
    op.add_column('transactions_log', sa.Column('result_code', sa.String(10), nullable=True))
    op.add_column('transactions_log', sa.Column('transaction_id', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('transaction_receipt', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('transaction_completed_datetime', sa.DateTime(), nullable=True))
    op.add_column('transactions_log', sa.Column('receiver_party_public_name', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('b2c_working_account_available_funds', sa.Float(), nullable=True))
    op.add_column('transactions_log', sa.Column('b2c_utility_account_available_funds', sa.Float(), nullable=True))
    op.add_column('transactions_log', sa.Column('b2c_charges_paid_account_available_funds', sa.Float(), nullable=True))
    op.add_column('transactions_log', sa.Column('remarks', sa.Text(), nullable=True))
    op.add_column('transactions_log', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    # 5. Create index on conversation_id for faster lookups
    op.create_index('ix_transactions_log_conversation_id', 'transactions_log', ['conversation_id'])

def downgrade():
    # This is a significant schema change, downgrade would require careful data migration
    # For now, we'll provide a basic downgrade that recreates the old structure
    
    # Drop new columns
    op.drop_index('ix_transactions_log_conversation_id', 'transactions_log')
    op.drop_column('transactions_log', 'updated_at')
    op.drop_column('transactions_log', 'remarks')
    op.drop_column('transactions_log', 'b2c_charges_paid_account_available_funds')
    op.drop_column('transactions_log', 'b2c_utility_account_available_funds')
    op.drop_column('transactions_log', 'b2c_working_account_available_funds')
    op.drop_column('transactions_log', 'receiver_party_public_name')
    op.drop_column('transactions_log', 'transaction_completed_datetime')
    op.drop_column('transactions_log', 'transaction_receipt')
    op.drop_column('transactions_log', 'transaction_id')
    op.drop_column('transactions_log', 'result_code')
    op.drop_column('transactions_log', 'result_type')
    op.drop_column('transactions_log', 'response_description')
    op.drop_column('transactions_log', 'response_code')
    op.drop_column('transactions_log', 'originator_conversation_id')
    op.drop_column('transactions_log', 'conversation_id')
    
    # Restore old columns
    op.add_column('transactions_log', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('transactions_log', sa.Column('transaction_date', sa.DateTime(), nullable=True))
    op.add_column('transactions_log', sa.Column('mpesa_receipt_number', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('mpesa_checkout_id', sa.String(100), nullable=True))
    op.add_column('transactions_log', sa.Column('transaction_type', sa.String(50), nullable=True))
    op.add_column('transactions_log', sa.Column('distance_meters', sa.Float(), nullable=True))
    
    # Make phone_number and amount nullable again
    op.alter_column('transactions_log', 'amount', existing_type=sa.Float(), nullable=True)
    op.alter_column('transactions_log', 'phone_number', existing_type=sa.String(20), nullable=True)
    
    # Drop location_transactions table
    op.drop_index('ix_location_transactions_mpesa_transaction_id', 'location_transactions')
    op.drop_index('ix_location_transactions_supplier_id', 'location_transactions')
    op.drop_index('ix_location_transactions_agent_id', 'location_transactions')
    op.drop_table('location_transactions')
