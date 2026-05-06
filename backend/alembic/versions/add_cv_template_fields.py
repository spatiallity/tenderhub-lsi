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
down_revision = 'fbec3b43ea51_add_assigned_pic_to_tender_watchlist'
branch_labels = None
depends_on = None


def upgrade():
    # Add new fields to experts table
    op.add_column('experts', sa.Column('tempat_lahir', sa.String(100), nullable=True))
    op.add_column('experts', sa.Column('tanggal_lahir', sa.String(50), nullable=True))
    op.add_column('experts', sa.Column('pendidikan_formal', sa.JSON(), nullable=True))
    op.add_column('experts', sa.Column('pendidikan_non_formal', sa.JSON(), nullable=True))
    op.add_column('experts', sa.Column('penguasaan_bahasa', sa.JSON(), nullable=True))
    op.add_column('experts', sa.Column('posisi_diusulkan', sa.String(100), nullable=True))
    
    # Add new fields to expert_projects table
    op.add_column('expert_projects', sa.Column('lokasi_proyek', sa.String(200), nullable=True))
    op.add_column('expert_projects', sa.Column('pengguna_jasa', sa.String(200), nullable=True))
    op.add_column('expert_projects', sa.Column('uraian_tugas', sa.Text(), nullable=True))
    op.add_column('expert_projects', sa.Column('waktu_mulai', sa.String(50), nullable=True))
    op.add_column('expert_projects', sa.Column('waktu_selesai', sa.String(50), nullable=True))
    op.add_column('expert_projects', sa.Column('posisi_penugasan', sa.String(100), nullable=True))
    op.add_column('expert_projects', sa.Column('status_kepegawaian', sa.String(50), nullable=True))
    op.add_column('expert_projects', sa.Column('surat_referensi', sa.String(100), nullable=True))


def downgrade():
    # Remove fields from expert_projects table
    op.drop_column('expert_projects', 'surat_referensi')
    op.drop_column('expert_projects', 'status_kepegawaian')
    op.drop_column('expert_projects', 'posisi_penugasan')
    op.drop_column('expert_projects', 'waktu_selesai')
    op.drop_column('expert_projects', 'waktu_mulai')
    op.drop_column('expert_projects', 'uraian_tugas')
    op.drop_column('expert_projects', 'pengguna_jasa')
    op.drop_column('expert_projects', 'lokasi_proyek')
    
    # Remove fields from experts table
    op.drop_column('experts', 'posisi_diusulkan')
    op.drop_column('experts', 'penguasaan_bahasa')
    op.drop_column('experts', 'pendidikan_non_formal')
    op.drop_column('experts', 'pendidikan_formal')
    op.drop_column('experts', 'tanggal_lahir')
    op.drop_column('experts', 'tempat_lahir')
