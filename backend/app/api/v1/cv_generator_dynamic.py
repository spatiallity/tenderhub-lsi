"""
CV Generator API - Dynamic Version
Generates CV documents with UNLIMITED project tables
Each project gets its own table, duplicated from template
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.expert import Expert
from docx import Document
from docx.table import Table
from io import BytesIO
from datetime import datetime
import os
import copy

router = APIRouter()

def replace_in_paragraph(paragraph, replacements):
    """Replace placeholders in a paragraph"""
    for placeholder, value in replacements.items():
        if placeholder in paragraph.text:
            # Replace in runs to preserve formatting
            for run in paragraph.runs:
                if placeholder in run.text:
                    run.text = run.text.replace(placeholder, str(value))

def fill_project_table(table, project, project_num):
    """Fill a project table with data from a single project"""
    
    # Extract year from waktu_mulai or waktu_selesai
    waktu_mulai = project.get('waktu_mulai', '')
    waktu_selesai = project.get('waktu_selesai', '')
    
    # Try to extract year
    year_start = waktu_mulai.split()[-1] if waktu_mulai else ''
    year_end = waktu_selesai.split()[-1] if waktu_selesai else ''
    year_display = f"{year_start} – {year_end}" if year_start and year_end else (year_start or year_end or '')
    
    replacements = {
        # Year header
        f'{{Tahun Awal Proyek {project_num}}}': year_start,
        f'{{Tahun Akhir Proyek {project_num}}}': year_end,
        '{Tahun Awal Proyek 1}': year_start,
        '{Tahun Akhir Proyek 1}': year_end,
        
        # Project details
        f'{{Nama Proyek {project_num}}}': project.get('nama_proyek', ''),
        f'{{Lokasi Proyek {project_num}}}': project.get('lokasi_proyek', ''),
        f'{{Nama Klien {project_num}}}': project.get('pengguna_jasa') or project.get('pemberi_kerja', ''),
        f'{{Nama Perusahaan Tempat Tenaga Ahli Di Hire {project_num}}}': project.get('nama_perusahaan_lain') or project.get('bersama', 'PT SUCOFINDO (Persero)'),
        f'{{Uraian deskripsi pekerjaan {project_num}}}': project.get('uraian_tugas', ''),
        f'{{Bulan Awal, Tahun {project_num}}}': waktu_mulai,
        f'{{Bulan Akhir, Tahun {project_num}}}': waktu_selesai,
        f'{{Posisi Penugasan {project_num}}}': project.get('posisi_penugasan') or project.get('peran', ''),
        f'{{Status Kepegawaian {project_num}}}': project.get('status_kepegawaian', 'Tidak Tetap'),
        f'{{Nomor Surat Referensi {project_num}}}': project.get('surat_referensi', '-'),
        
        # Generic placeholders (without numbers) - for first project
        '{Nama Proyek}': project.get('nama_proyek', ''),
        '{Lokasi Proyek}': project.get('lokasi_proyek', ''),
        '{Nama Klien}': project.get('pengguna_jasa') or project.get('pemberi_kerja', ''),
        '{Nama Perusahaan Tempat Tenaga Ahli Di Hire}': project.get('nama_perusahaan_lain') or project.get('bersama', 'PT SUCOFINDO (Persero)'),
        '{Uraian deskripsi pekerjaan 1}': project.get('uraian_tugas', ''),
        '{Uraian deskripsi pekerjaan 2}': '',
        '{Bulan Awal, Tahun}': waktu_mulai,
        '{Bulan Akhir, Tahun}': waktu_selesai,
        '{Durasi}': f"{waktu_mulai} – {waktu_selesai}" if waktu_mulai and waktu_selesai else '',
        '{Posisi Penugasan}': project.get('posisi_penugasan') or project.get('peran', ''),
        '{Status Kepegawaian}': project.get('status_kepegawaian', 'Tidak Tetap'),
        '{Nomor Surat Referensi}': project.get('surat_referensi', '-'),
    }
    
    # Replace in all cells
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                replace_in_paragraph(paragraph, replacements)

def generate_cv_from_template_dynamic(expert_data, template_path):
    """
    Generate CV from Sucofindo DOCX template with DYNAMIC project tables
    
    Template structure:
    - Table 0: Header info (Posisi, Nama, Tempat/Tanggal Lahir, Pendidikan, dll)
    - Table 1: First project (template) - will be duplicated for each project
    - Last Table: Signature section
    
    This function will:
    1. Fill header table with personal info
    2. Fill first project table
    3. Duplicate project table for each additional project
    4. Fill signature table
    """
    
    try:
        # Load template
        doc = Document(template_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load template: {str(e)}"
        )
    
    # Get data with safe defaults
    nama = expert_data.get('nama', 'Belum diisi')
    tempat_lahir = expert_data.get('tempat_lahir', 'Belum diisi')
    tanggal_lahir = expert_data.get('tanggal_lahir', 'Belum diisi')
    posisi_diusulkan = expert_data.get('posisi_diusulkan', 'Team Leader')
    
    # Format education
    pendidikan_formal = expert_data.get('pendidikan_formal', [])
    if isinstance(pendidikan_formal, list) and pendidikan_formal:
        pendidikan_formal_text = "\n".join(str(p) for p in pendidikan_formal)
    else:
        pendidikan_formal_text = ""
    
    pendidikan_non_formal = expert_data.get('pendidikan_non_formal', [])
    if isinstance(pendidikan_non_formal, list) and pendidikan_non_formal:
        pendidikan_non_formal_text = "\n".join(str(p) for p in pendidikan_non_formal)
    else:
        pendidikan_non_formal_text = ""
    
    penguasaan_bahasa = expert_data.get('penguasaan_bahasa', [])
    if isinstance(penguasaan_bahasa, list) and penguasaan_bahasa:
        penguasaan_bahasa_text = "\n".join(str(b) for b in penguasaan_bahasa)
    else:
        penguasaan_bahasa_text = "Bahasa Indonesia Baik\nBahasa Inggris Baik"
    
    # Prepare replacements for header table
    header_replacements = {
        '{Posisi yang Diusulkan}': posisi_diusulkan,
        '{Nama Lengkap}': nama,
        '{Tempat Lahir}': tempat_lahir,
        '{Tanggal Lahir}': tanggal_lahir,
        '{Tempat, Tanggal Lahir}': f"{tempat_lahir}, {tanggal_lahir}",
        '{Pendidikan Formal}': pendidikan_formal_text,
        '{Pendidikan Non-Formal}': pendidikan_non_formal_text,
        '{Penguasaan Bahasa}': penguasaan_bahasa_text,
    }
    
    try:
        # Replace in header table (Table 0)
        if len(doc.tables) > 0:
            header_table = doc.tables[0]
            print(f"[CV Generator Dynamic] Processing header table")
            for row in header_table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        replace_in_paragraph(paragraph, header_replacements)
        
        # Handle projects dynamically
        projects = expert_data.get('projects', [])
        print(f"[CV Generator Dynamic] Processing {len(projects)} projects")
        
        if len(projects) > 0 and len(doc.tables) > 1:
            # Find the first project table (should be table index 1)
            project_table_index = 1
            first_project_table = doc.tables[project_table_index]
            
            # Fill first project table
            print(f"[CV Generator Dynamic] Filling project 1")
            fill_project_table(first_project_table, projects[0], 1)
            
            # For additional projects, duplicate the table
            if len(projects) > 1:
                # Get the table element's parent and position
                table_element = first_project_table._element
                parent = table_element.getparent()
                
                # Find the position of the first project table
                table_position = list(parent).index(table_element)
                
                # Add additional project tables
                for i in range(1, len(projects)):
                    project_num = i + 1
                    print(f"[CV Generator Dynamic] Adding and filling project {project_num}")
                    
                    # Create a deep copy of the first project table
                    new_table_element = copy.deepcopy(table_element)
                    
                    # Insert the new table after the previous one
                    # Add a paragraph break before the new table for spacing
                    from docx.oxml import OxmlElement
                    paragraph_element = OxmlElement('w:p')
                    insert_position = table_position + (i * 2)
                    parent.insert(insert_position, paragraph_element)
                    parent.insert(insert_position + 1, new_table_element)
                    
                    # Create a Table object from the element to work with it
                    new_table = Table(new_table_element, doc)
                    
                    # Fill the new table with project data
                    fill_project_table(new_table, projects[i], project_num)
        
        # Update signature table (last table)
        if len(doc.tables) > 0:
            signature_table = doc.tables[-1]
            print(f"[CV Generator Dynamic] Processing signature table")
            
            tanggal_sekarang = datetime.now().strftime('%d %B %Y')
            signature_replacements = {
                '{Tanggal}': tanggal_sekarang,
                '{Nama}': nama,
                '{Posisi}': posisi_diusulkan,
            }
            
            for row in signature_table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        replace_in_paragraph(paragraph, signature_replacements)
    
    except Exception as e:
        print(f"[CV Generator Dynamic] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing template: {str(e)}"
        )
    
    # Save to BytesIO
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    
    print(f"[CV Generator Dynamic] CV generated successfully with {len(projects)} project tables")
    return output

@router.get("/{expert_id}/cv")
async def generate_expert_cv_dynamic(
    expert_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate CV document for an expert using Sucofindo template
    Supports UNLIMITED number of projects (dynamic table generation)
    Returns a downloadable DOCX file
    """
    
    try:
        # Get expert with all related data
        result = await db.execute(
            select(Expert)
            .options(selectinload(Expert.projects), selectinload(Expert.reviews))
            .where(Expert.id == expert_id)
        )
        expert = result.scalars().first()
        
        if not expert:
            raise HTTPException(status_code=404, detail="Expert not found")
        
        print(f"[CV Generator Dynamic] Generating CV for expert: {expert.nama} (ID: {expert_id})")
        print(f"[CV Generator Dynamic] Total projects: {len(expert.projects)}")
        
        # Prepare expert data
        expert_data = {
            'nama': expert.nama,
            'posisi_diusulkan': getattr(expert, 'posisi_diusulkan', None) or 'Team Leader',
            'tempat_lahir': getattr(expert, 'tempat_lahir', None) or 'Belum diisi',
            'tanggal_lahir': getattr(expert, 'tanggal_lahir', None) or 'Belum diisi',
            'pendidikan_formal': getattr(expert, 'pendidikan_formal', None) or [],
            'pendidikan_non_formal': getattr(expert, 'pendidikan_non_formal', None) or [],
            'penguasaan_bahasa': getattr(expert, 'penguasaan_bahasa', None) or ['Bahasa Indonesia Baik', 'Bahasa Inggris Baik'],
            'projects': [
                {
                    'nama_proyek': p.nama_proyek,
                    'lokasi_proyek': getattr(p, 'lokasi_proyek', None) or 'Belum diisi',
                    'pengguna_jasa': getattr(p, 'pengguna_jasa', None) or p.pemberi_kerja or 'Belum diisi',
                    'nama_perusahaan_lain': p.nama_perusahaan_lain or 'PT SUCOFINDO (PERSERO)',
                    'bersama': p.bersama or 'PT SUCOFINDO (PERSERO)',
                    'uraian_tugas': getattr(p, 'uraian_tugas', None) or 'Belum diisi',
                    'waktu_mulai': getattr(p, 'waktu_mulai', None) or (str(p.tahun) if p.tahun else ''),
                    'waktu_selesai': getattr(p, 'waktu_selesai', None) or (str(p.tahun) if p.tahun else ''),
                    'posisi_penugasan': getattr(p, 'posisi_penugasan', None) or p.peran or 'Belum diisi',
                    'status_kepegawaian': getattr(p, 'status_kepegawaian', None) or 'Tidak Tetap',
                    'surat_referensi': getattr(p, 'surat_referensi', None) or '-',
                    'peran': p.peran,
                    'pemberi_kerja': p.pemberi_kerja,
                }
                for p in expert.projects  # ✅ ALL projects, not limited to 3
            ]
        }
        
        print(f"[CV Generator Dynamic] Expert data prepared. Projects: {len(expert_data['projects'])}")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CV Generator Dynamic] Error preparing expert data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error preparing expert data: {str(e)}"
        )
    
    # Get template path
    template_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        'TEMPLATE_CV_EXPERT.docx'
    )
    
    if not os.path.exists(template_path):
        template_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))),
            'TEMPLATE_CV_EXPERT.docx'
        )
    
    if not os.path.exists(template_path):
        template_path = os.path.join(os.getcwd(), 'TEMPLATE_CV_EXPERT.docx')
    
    if not os.path.exists(template_path):
        template_path = os.path.join(os.path.dirname(os.getcwd()), 'TEMPLATE_CV_EXPERT.docx')
    
    print(f"[CV Generator Dynamic] Template path: {template_path}")
    print(f"[CV Generator Dynamic] Template exists: {os.path.exists(template_path)}")
    
    if not os.path.exists(template_path):
        raise HTTPException(
            status_code=500, 
            detail=f"CV template not found at: {template_path}"
        )
    
    # Generate CV with dynamic tables
    try:
        print(f"[CV Generator Dynamic] Starting CV generation...")
        cv_file = generate_cv_from_template_dynamic(expert_data, template_path)
        print(f"[CV Generator Dynamic] CV generated successfully")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CV Generator Dynamic] Error generating CV: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate CV: {str(e)}"
        )
    
    # Return as downloadable file
    filename = f"CV_{expert.nama.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.docx"
    
    return StreamingResponse(
        cv_file,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
