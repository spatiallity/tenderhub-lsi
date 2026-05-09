"""add branch claim columns + rup_watchlist

Revision ID: add_branch_claim
Revises: add_cv_template_fields
Create Date: 2026-05-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'add_branch_claim'
down_revision = 'add_cv_template_fields'
branch_labels = None
depends_on = None


def upgrade():
    # 1. tender_watchlist: branch claim columns
    op.add_column('tender_watchlist', sa.Column('unit_kerja', sa.String(100), nullable=True))
    op.add_column('tender_watchlist', sa.Column('unit_kerja_region', sa.String(20), nullable=True))
    op.add_column('tender_watchlist', sa.Column('claimed_by', postgresql.UUID(as_uuid=False), nullable=True))
    op.add_column('tender_watchlist', sa.Column('claimed_at', sa.DateTime(), nullable=True))
    op.create_index('ix_tender_watchlist_unit_kerja', 'tender_watchlist', ['unit_kerja'])

    # 2. rup_watchlist: new table
    op.create_table(
        'rup_watchlist',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('kd_rup', sa.String(100), nullable=False, unique=True, index=True),
        sa.Column('nama_paket', sa.String(400), nullable=True),
        sa.Column('nama_klpd', sa.String(300), nullable=True),
        sa.Column('pagu', sa.Float(), nullable=True),
        sa.Column('status_internal', sa.String(50), server_default='Dipantau'),
        sa.Column('catatan_internal', sa.Text(), nullable=True),
        sa.Column('unit_kerja', sa.String(100), nullable=True, index=True),
        sa.Column('unit_kerja_region', sa.String(20), nullable=True),
        sa.Column('claimed_by', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('claimed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table('rup_watchlist')
    op.drop_index('ix_tender_watchlist_unit_kerja', table_name='tender_watchlist')
    op.drop_column('tender_watchlist', 'claimed_at')
    op.drop_column('tender_watchlist', 'claimed_by')
    op.drop_column('tender_watchlist', 'unit_kerja_region')
    op.drop_column('tender_watchlist', 'unit_kerja')
