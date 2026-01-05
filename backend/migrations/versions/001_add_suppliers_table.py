"""Add suppliers table

Revision ID: 001_add_suppliers_table
Revises: 25bd9bdd734f
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_add_suppliers_table'
down_revision = '25bd9bdd734f'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('supplier_id', sa.String(length=50), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('mpesa_phone_number', sa.String(length=20), nullable=False),
        sa.Column('contact_person', sa.String(length=100)),
        sa.Column('contact_email', sa.String(length=100)),
        sa.Column('address', sa.String(length=200)),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('supplier_id')
    )

def downgrade():
    op.drop_table('suppliers')
