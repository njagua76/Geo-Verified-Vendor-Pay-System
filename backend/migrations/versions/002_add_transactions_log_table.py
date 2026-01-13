"""Add transactions_log table

Revision ID: 002_add_transactions_log_table
Revises: 001_add_suppliers_table
Create Date: 2025-01-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '002_add_transactions_log_table'
down_revision = '001_add_suppliers_table'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('transactions_log',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('supplier_id', sa.Integer(), nullable=False),
    sa.Column('agent_id', sa.Integer(), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('distance_meters', sa.Float(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('transactions_log')
