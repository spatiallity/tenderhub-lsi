"""
CV Generator API
Generates CV documents from DOCX template following Sucofindo format
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.expert import Expert
from docx import Document
from io import BytesIO
from datetime import datetime
import os

router = APIRouter()

def replace_text_in_cell(cell, old_text, new_text):
    """Replace text in a cell while preserving formatting"""
    try:
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                if old_text in run.text:
                    run.text = run.text.replace(old_text, str(new_text))
    except Exception as e:
        print(f"Error replacing text in cell: {e}")

def generate_cv_from_template(expert_data, template_path):
    """
    Generate CV from Sucofindo DOCX template
    
    Template structure:
    - Table 0: Header info (Posisi, Nama, Tempat/Tanggal Lahir, Pendidikan, dll)
    - Tables 1-N: Individual project entries with subsections a-i
    - Last Table: Signature section
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
    
    # Format education with type checking
    pendidikan_formal = expert_data.get('pendidikan_formal', [])
    if isinstance(pendidikan_formal, list) and pendidikan_formal:
        pendidikan_formal_text = "\n".join(str(p) for p in pendidikan_formal)
    else:
        pendidikan_formal_text = "Belum diisi"
    
    # Format non-formal education with type checking
    pendidikan_non_formal = expert_data.get('pendidikan_non_formal', [])
    if isinstance(pendidikan_non_formal, list) and pendidikan_non_formal:
        pendidikan_non_formal_text = "\n".join(str(p) for p in pendidikan_non_formal)
    else:
        pendidikan_non_formal_text = "Belum diisi"
    
    # Format language skills with type checking
    penguasaan_bahasa = expert_data.get('penguasaan_bahasa', [])
    if isinstance(penguasaan_bahasa, list) and penguasaan_bahasa:
        penguasaan_bahasa_text = "\n".join(str(b) for b in penguasaan_bahasa)
    else:
        penguasaan_bahasa_text = "Bahasa Indonesia Baik\nBahasa Inggris Baik"
    
    try:
        # Replace in Table 0 (Header info)
        if len(doc.tables) > 0:
            header_table = doc.tables[0]
            
            # Row 0: Posisi yang diusulkan
            if len(header_table.rows) > 0:
                replace_text_in_cell(header_table.rows[0].cells[3], 'Team Leader', posisi_diusulkan)
            
            # Row 2: Nama Personel
            if len(header_table.rows) > 2:
                replace_text_in_cell(header_table.rows[2].cells[3], 'Asep Hendy Sopyandi', nama)
            
            # Row 3: Tempat/Tanggal Lahir
            if len(header_table.rows) > 3:
                replace_text_in_cell(header_table.rows[3].cells[3], 'Bandung, 7 Juli 1967', f"{tempat_lahir}, {tanggal_lahir}")
            
            # Row 4: Pendidikan Formal
            if len(header_table.rows) > 4:
                cell = header_table.rows[4].cells[3]
                for paragraph in cell.paragraphs:
                    paragraph.clear()
                if cell.paragraphs:
                    cell.paragraphs[0].text = pendidikan_formal_text
            
            # Row 5: Pendidikan Non Formal
            if len(header_table.rows) > 5:
                cell = header_table.rows[5].cells[3]
                for paragraph in cell.paragraphs:
                    paragraph.clear()
                if cell.paragraphs:
                    cell.paragraphs[0].text = pendidikan_non_formal_text
            
            # Row 6: Penguasaan Bahasa
            if len(header_table.rows) > 6:
                cell = header_table.rows[6].cells[3]
                for paragraph in cell.paragraphs:
                    paragraph.clear()
                if cell.paragraphs:
                    cell.paragraphs[0].text = penguasaan_bahasa_text
        
        # Replace project data in subsequent tables (Tables 1, 2, 3, ...)
        projects = expert_data.get('projects', [])
        project_tables = doc.tables[1:-1] if len(doc.tables) > 2 else []
        
        for idx, project in enumerate(projects):
            if idx >= len(project_tables):
                break
            
            project_table = project_tables[idx]
            
            # Row 1: a. Nama Proyek
            if len(project_table.rows) > 1:
                replace_text_in_cell(project_table.rows[1].cells[3], 
                                    'Penyusunan Rencana Pengembangan Kawasan', 
                                    project.get('nama_proyek', 'Belum diisi'))
            
            # Row 2: b. Lokasi Proyek
            if len(project_table.rows) > 2:
                replace_text_in_cell(project_table.rows[2].cells[3], 
                                    'Kel. Sepaku, Kec. Sapaku', 
                                    project.get('lokasi_proyek', 'Belum diisi'))
            
            # Row 3: c. Pengguna Jasa
            if len(project_table.rows) > 3:
                replace_text_in_cell(project_table.rows[3].cells[3], 
                                    'Direktorat Perencanaan Mikro', 
                                    project.get('pengguna_jasa', 'Belum diisi'))
            
            # Row 4: d. Nama Perusahaan
            if len(project_table.rows) > 4:
                replace_text_in_cell(project_table.rows[4].cells[3], 
                                    'PT. Ciriajasa Engineering Consultant', 
                                    project.get('nama_perusahaan', 'PT SUCOFINDO (PERSERO)'))
            
            # Row 5: e. Uraian Tugas
            if len(project_table.rows) > 5:
                cell = project_table.rows[5].cells[3]
                for paragraph in cell.paragraphs:
                    paragraph.clear()
                if cell.paragraphs:
                    cell.paragraphs[0].text = project.get('uraian_tugas', 'Belum diisi')
            
            # Row 6: f. Waktu Pelaksanaan
            if len(project_table.rows) > 6:
                waktu_mulai = project.get('waktu_mulai', '')
                waktu_selesai = project.get('waktu_selesai', '')
                waktu_text = f"{waktu_mulai}-{waktu_selesai}" if waktu_mulai and waktu_selesai else "Belum diisi"
                replace_text_in_cell(project_table.rows[6].cells[3], 
                                    'Agustus 2025-Desember 2025', 
                                    waktu_text)
            
            # Row 7: g. Posisi Penugasan
            if len(project_table.rows) > 7:
                replace_text_in_cell(project_table.rows[7].cells[3], 
                                    'Ahli Perencanaan Wilayah dan Kota', 
                                    project.get('posisi_penugasan', 'Belum diisi'))
            
            # Row 8: h. Status Kepegawaian
            if len(project_table.rows) > 8:
                replace_text_in_cell(project_table.rows[8].cells[3], 
                                    'Tidak Tetap', 
                                    project.get('status_kepegawaian', 'Tidak Tetap'))
            
            # Row 9: i. Surat Referensi
            if len(project_table.rows) > 9:
                replace_text_in_cell(project_table.rows[9].cells[3], 
                                    '-', 
                                    project.get('surat_referensi', '-'))
        
        # Update signature table (last table)
        if len(doc.tables) > 0:
            signature_table = doc.tables[-1]
            # Update date
            if len(signature_table.rows) > 0:
                today = datetime.now().strftime("%d %B %Y")
                replace_text_in_cell(signature_table.rows[0].cells[0], 
                                    'Jakarta, 29 Januari 2026', 
                                    f"Jakarta, {today}")
            
            # Update name in signature
            if len(signature_table.rows) > 3:
                replace_text_in_cell(signature_table.rows[3].cells[0], 
                                    'Ir. Asep Hendy Sopyandi, MT', 
                                    nama)
            
            # Update position in signature
            if len(signature_table.rows) > 4:
                replace_text_in_cell(signature_table.rows[4].cells[0], 
                                    'Team Leader', 
                                    posisi_diusulkan)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing template: {str(e)}"
        )
    
    # Save to BytesIO
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    
    return output

@router.get("/{expert_id}/cv")
async def generate_expert_cv(
    expert_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate CV document for an expert using Sucofindo template
    Returns a downloadable DOCX file
    """
    
    # Get expert with all related data
    result = await db.execute(
        select(Expert)
        .options(selectinload(Expert.projects), selectinload(Expert.reviews))
        .where(Expert.id == expert_id)
    )
    expert = result.scalars().first()
    
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    # Prepare expert data following template structure
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
                'nama_perusahaan': p.nama_perusahaan_lain or 'PT SUCOFINDO (PERSERO)',
                'uraian_tugas': getattr(p, 'uraian_tugas', None) or 'Belum diisi',
                'waktu_mulai': getattr(p, 'waktu_mulai', None) or (str(p.tahun) if p.tahun else ''),
                'waktu_selesai': getattr(p, 'waktu_selesai', None) or (str(p.tahun) if p.tahun else ''),
                'posisi_penugasan': getattr(p, 'posisi_penugasan', None) or p.peran or 'Belum diisi',
                'status_kepegawaian': getattr(p, 'status_kepegawaian', None) or 'Tidak Tetap',
                'surat_referensi': getattr(p, 'surat_referensi', None) or '-',
            }
            for p in expert.projects[:3]  # Max 3 projects (template has 3 project tables)
        ]
    }
    
    # Get template path
    template_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        'TEMPLATE_CV_EXPERT.docx'
    )
    
    if not os.path.exists(template_path):
        raise HTTPException(
            status_code=500, 
            detail=f"CV template not found at: {template_path}. Please ensure TEMPLATE_CV_EXPERT.docx exists in project root."
        )
    
    # Generate CV
    try:
        cv_file = generate_cv_from_template(expert_data, template_path)
    except HTTPException:
        raise
    except Exception as e:
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
