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


def _table_exists(table: str) -> bool:
    """True if ``table`` exists on the bound DB.

    Allows the migration to be a no-op on a fresh DB where
    ``Base.metadata.create_all`` hasn't been called yet.
    """
    bind = op.get_bind()
    insp = sa.inspect(bind)
    return table in insp.get_table_names()


def _column_exists(table: str, column: str) -> bool:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing = {c['name'] for c in insp.get_columns(table)}
    return column in existing


def _index_exists(index_name: str, table: str) -> bool:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing = {idx['name'] for idx in insp.get_indexes(table)}
    return index_name in existing


def _add_column_if_absent(table: str, column: sa.Column) -> None:
    if not _table_exists(table):
        return
    if _column_exists(table, column.name):
        return
    op.add_column(table, column)


def _drop_column_if_present(table: str, column_name: str) -> None:
    if not _table_exists(table):
        return
    if not _column_exists(table, column_name):
        return
    op.drop_column(table, column_name)


def _create_index_if_absent(index_name: str, table: str, columns: list) -> None:
    if not _table_exists(table):
        return
    if _index_exists(index_name, table):
        return
    op.create_index(index_name, table, columns)


def _drop_index_if_present(index_name: str, table: str) -> None:
    if not _table_exists(table):
        return
    if not _index_exists(index_name, table):
        return
    op.drop_index(index_name, table_name=table)


def upgrade():
    # 1. tender_watchlist: branch claim columns (guarded individually)
    _add_column_if_absent('tender_watchlist', sa.Column('unit_kerja', sa.String(100), nullable=True))
    _add_column_if_absent('tender_watchlist', sa.Column('unit_kerja_region', sa.String(20), nullable=True))
    _add_column_if_absent('tender_watchlist', sa.Column('claimed_by', postgresql.UUID(as_uuid=False), nullable=True))
    _add_column_if_absent('tender_watchlist', sa.Column('claimed_at', sa.DateTime(), nullable=True))
    _create_index_if_absent('ix_tender_watchlist_unit_kerja', 'tender_watchlist', ['unit_kerja'])

    # 2. rup_watchlist: new table (skip if already present so idempotent)
    if not _table_exists('rup_watchlist'):
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
    if _table_exists('rup_watchlist'):
        op.drop_table('rup_watchlist')
    _drop_index_if_present('ix_tender_watchlist_unit_kerja', 'tender_watchlist')
    _drop_column_if_present('tender_watchlist', 'claimed_at')
    _drop_column_if_present('tender_watchlist', 'claimed_by')
    _drop_column_if_present('tender_watchlist', 'unit_kerja_region')
    _drop_column_if_present('tender_watchlist', 'unit_kerja')
