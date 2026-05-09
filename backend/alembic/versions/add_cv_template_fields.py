"""add cv template fields

Revision ID: add_cv_template_fields
Revises: fbec3b43ea51
Create Date: 2026-05-06 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_cv_template_fields'
# NOTE: down_revision MUST be the actual revision id declared by the parent
# migration module (``revision = 'fbec3b43ea51'`` in
# ``fbec3b43ea51_add_assigned_pic_to_tender_watchlist.py``), NOT the filename
# stem.  Using the filename stem here broke the revision graph and caused
# ``alembic upgrade head`` to fail with
# ``Can't locate revision identified by 'fbec3b43ea51_add_assigned_pic_to_tender_watchlist'``.
down_revision = 'fbec3b43ea51'
branch_labels = None
depends_on = None


def _table_exists(table: str) -> bool:
    """Return ``True`` when ``table`` exists on the bound DB.

    Allows the migration to be a clean no-op on a fresh DB where tables
    haven't been created yet (Alembic runs before the FastAPI lifespan
    invokes ``Base.metadata.create_all``).
    """
    bind = op.get_bind()
    insp = sa.inspect(bind)
    return table in insp.get_table_names()


def _add_column_if_absent(table: str, column: sa.Column) -> None:
    """Add ``column`` to ``table`` only if it isn't already present.

    Makes the migration idempotent when run against a DB where the column
    was added out-of-band (e.g. via ``supabase/add_cv_template_fields.sql``
    or a previous partial manual ALTER), and a no-op when ``table`` doesn't
    exist yet at all.
    """
    if not _table_exists(table):
        return
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing = {c['name'] for c in insp.get_columns(table)}
    if column.name not in existing:
        op.add_column(table, column)


def _drop_column_if_present(table: str, column_name: str) -> None:
    """Drop ``column_name`` from ``table`` only if both table + column exist."""
    if not _table_exists(table):
        return
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing = {c['name'] for c in insp.get_columns(table)}
    if column_name in existing:
        op.drop_column(table, column_name)


def upgrade():
    # Add new fields to experts table
    _add_column_if_absent('experts', sa.Column('tempat_lahir', sa.String(100), nullable=True))
    _add_column_if_absent('experts', sa.Column('tanggal_lahir', sa.String(50), nullable=True))
    _add_column_if_absent('experts', sa.Column('pendidikan_formal', sa.JSON(), nullable=True))
    _add_column_if_absent('experts', sa.Column('pendidikan_non_formal', sa.JSON(), nullable=True))
    _add_column_if_absent('experts', sa.Column('penguasaan_bahasa', sa.JSON(), nullable=True))
    _add_column_if_absent('experts', sa.Column('posisi_diusulkan', sa.String(100), nullable=True))

    # Add new fields to expert_projects table
    _add_column_if_absent('expert_projects', sa.Column('lokasi_proyek', sa.String(200), nullable=True))
    _add_column_if_absent('expert_projects', sa.Column('pengguna_jasa', sa.String(200), nullable=True))
    _add_column_if_absent('expert_projects', sa.Column('uraian_tugas', sa.Text(), nullable=True))
    _add_column_if_absent('expert_projects', sa.Column('waktu_mulai', sa.String(50), nullable=True))
    _add_column_if_absent('expert_projects', sa.Column('waktu_selesai', sa.String(50), nullable=True))
    _add_column_if_absent('expert_projects', sa.Column('posisi_penugasan', sa.String(100), nullable=True))
    _add_column_if_absent('expert_projects', sa.Column('status_kepegawaian', sa.String(50), nullable=True))
    _add_column_if_absent('expert_projects', sa.Column('surat_referensi', sa.String(100), nullable=True))


def downgrade():
    # Remove fields from expert_projects table
    _drop_column_if_present('expert_projects', 'surat_referensi')
    _drop_column_if_present('expert_projects', 'status_kepegawaian')
    _drop_column_if_present('expert_projects', 'posisi_penugasan')
    _drop_column_if_present('expert_projects', 'waktu_selesai')
    _drop_column_if_present('expert_projects', 'waktu_mulai')
    _drop_column_if_present('expert_projects', 'uraian_tugas')
    _drop_column_if_present('expert_projects', 'pengguna_jasa')
    _drop_column_if_present('expert_projects', 'lokasi_proyek')

    # Remove fields from experts table
    _drop_column_if_present('experts', 'posisi_diusulkan')
    _drop_column_if_present('experts', 'penguasaan_bahasa')
    _drop_column_if_present('experts', 'pendidikan_non_formal')
    _drop_column_if_present('experts', 'pendidikan_formal')
    _drop_column_if_present('experts', 'tanggal_lahir')
    _drop_column_if_present('experts', 'tempat_lahir')
