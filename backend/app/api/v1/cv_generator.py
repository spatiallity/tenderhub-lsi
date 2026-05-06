"""
CV Generator API
Generates CV documents from DOCX template with expert data
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.expert import Expert
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from io import BytesIO
from datetime import datetime
import os

router = APIRouter()

def replace_placeholder(paragraph, placeholder, value):
    """Replace placeholder in paragraph while preserving formatting"""
    if placeholder in paragraph.text:
        # Get all runs in the paragraph
        full_text = paragraph.text
        new_text = full_text.replace(placeholder, str(value))
        
        # Clear existing runs
        for run in paragraph.runs:
            run.text = ''
        
        # Add new text to first run
        if paragraph.runs:
            paragraph.runs[0].text = new_text
        else:
            paragraph.add_run(new_text)

def replace_in_table(table, placeholder, value):
    """Replace placeholder in table cells"""
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                replace_placeholder(paragraph, placeholder, str(value))

def format_currency(value):
    """Format number as Indonesian Rupiah"""
    if not value:
        return "Rp 0"
    try:
        return f"Rp {int(value):,}".replace(',', '.')
    except:
        return str(value)

def generate_cv_from_template(expert_data, template_path):
    """
    Generate CV from DOCX template
    
    Placeholders in template:
    - {{NAMA}} - Expert name
    - {{NO_HP}} - Phone number
    - {{INSTANSI}} - Institution
    - {{KEAHLIAN}} - Expertise (comma separated)
    - {{AVAILABILITY}} - Availability status
    - {{RATING}} - Rating score
    - {{JUMLAH_PROYEK}} - Number of projects
    - {{TANGGAL_GENERATE}} - Generation date
    
    For project history table:
    - {{PROYEK_1}}, {{KLIEN_1}}, {{TAHUN_1}}, {{NILAI_1}}, {{PERAN_1}}, {{STATUS_1}}
    - {{PROYEK_2}}, {{KLIEN_2}}, {{TAHUN_2}}, {{NILAI_2}}, {{PERAN_2}}, {{STATUS_2}}
    - etc.
    """
    
    # Load template
    doc = Document(template_path)
    
    # Basic replacements
    replacements = {
        '{{NAMA}}': expert_data.get('nama', ''),
        '{{NO_HP}}': expert_data.get('no_hp', ''),
        '{{INSTANSI}}': expert_data.get('instansi', ''),
        '{{KEAHLIAN}}': ', '.join(expert_data.get('keahlian', [])),
        '{{AVAILABILITY}}': expert_data.get('availability', ''),
        '{{RATING}}': f"{expert_data.get('rating_avg', 0):.1f}/5.0",
        '{{JUMLAH_PROYEK}}': str(expert_data.get('jumlah_proyek', 0)),
        '{{TANGGAL_GENERATE}}': datetime.now().strftime('%d %B %Y'),
    }
    
    # Replace in paragraphs
    for paragraph in doc.paragraphs:
        for placeholder, value in replacements.items():
            replace_placeholder(paragraph, placeholder, value)
    
    # Replace in tables
    for table in doc.tables:
        for placeholder, value in replacements.items():
            replace_in_table(table, placeholder, value)
        
        # Handle project history in tables
        projects = expert_data.get('projects', [])
        for idx, project in enumerate(projects[:10], 1):  # Max 10 projects
            project_replacements = {
                f'{{{{PROYEK_{idx}}}}}': project.get('nama_proyek', ''),
                f'{{{{KLIEN_{idx}}}}}': project.get('pemberi_kerja', ''),
                f'{{{{TAHUN_{idx}}}}}': str(project.get('tahun', '')),
                f'{{{{NILAI_{idx}}}}}': format_currency(project.get('nilai_proyek', 0)),
                f'{{{{PERAN_{idx}}}}}': project.get('peran', ''),
                f'{{{{STATUS_{idx}}}}}': project.get('status_proyek', ''),
            }
            
            for placeholder, value in project_replacements.items():
                replace_in_table(table, placeholder, value)
    
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
    Generate CV document for an expert
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
    
    # Prepare expert data
    expert_data = {
        'nama': expert.nama,
        'no_hp': expert.no_hp or '',
        'instansi': expert.instansi or '',
        'keahlian': expert.keahlian or [],
        'availability': expert.availability,
        'rating_avg': expert.rating_avg,
        'jumlah_proyek': expert.jumlah_proyek,
        'projects': [
            {
                'nama_proyek': p.nama_proyek,
                'pemberi_kerja': p.pemberi_kerja,
                'tahun': p.tahun,
                'nilai_proyek': p.nilai_proyek,
                'peran': p.peran,
                'status_proyek': p.status_proyek,
            }
            for p in expert.projects
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
            detail="CV template not found. Please ensure TEMPLATE_CV_EXPERT.docx exists in project root."
        )
    
    # Generate CV
    try:
        cv_file = generate_cv_from_template(expert_data, template_path)
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
