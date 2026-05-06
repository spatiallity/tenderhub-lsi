# CV Template Guide - TenderHub LSI

## 📄 Overview

Fitur Generate CV menggunakan template DOCX resmi Sucofindo (`TEMPLATE_CV_EXPERT.docx`) yang ada di root project. Template ini akan diisi otomatis dengan data expert dari database **mengikuti format template yang sudah ada**.

## 🎯 Prinsip Utama

**PENTING**: Database fields dirancang untuk mengikuti template CV Sucofindo, bukan sebaliknya. Template adalah sumber kebenaran (source of truth).

## 🔧 Setup

### 1. Install Dependencies

```bash
cd backend
pip install python-docx==1.1.2
```

### 2. Template Location

Template harus ada di:
```
TenderHub LSIv2/
├── TEMPLATE_CV_EXPERT.docx  ← Template file (JANGAN DIUBAH)
├── backend/
├── frontend/
└── ...
```

### 3. Database Migration

Jalankan SQL migration di Supabase:
```sql
-- File: supabase/add_cv_template_fields.sql
-- Menambahkan field-field yang dibutuhkan template
```

## 📋 Template Structure (Sucofindo Format)

Template memiliki struktur sebagai berikut:

### Table 0: Header Information
1. Posisi yang diusulkan
2. Nama Perusahaan (PT SUCOFINDO PERSERO)
3. Nama Personel
4. Tempat/Tanggal Lahir
5. Pendidikan (Formal)
6. Pendidikan Non Formal
7. Penguasaan Bahasa
8. Pengalaman Kerja

### Tables 1-3: Project History
Setiap proyek memiliki subsection:
- a. Nama Proyek
- b. Lokasi Proyek
- c. Pengguna Jasa
- d. Nama Perusahaan
- e. Uraian Tugas
- f. Waktu Pelaksanaan
- g. Posisi Penugasan
- h. Status Kepegawaian
- i. Surat Referensi

### Last Table: Signature
- Tanggal
- Nama
- Posisi

## 📊 Database Schema

### Experts Table - New Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `tempat_lahir` | VARCHAR(100) | Tempat lahir | "Bandung" |
| `tanggal_lahir` | VARCHAR(50) | Tanggal lahir | "7 Juli 1967" |
| `pendidikan_formal` | JSONB | Array pendidikan formal | `["S1 Teknik Planologi ITB", "S2 Perencanaan Wilayah UGM"]` |
| `pendidikan_non_formal` | JSONB | Array training/sertifikat | `["Training Certificate Increasing Capacity"]` |
| `penguasaan_bahasa` | JSONB | Array bahasa | `["Bahasa Indonesia Baik", "Bahasa Inggris Baik"]` |
| `posisi_diusulkan` | VARCHAR(100) | Posisi dalam tender | "Team Leader" |

### Expert_Projects Table - New Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `lokasi_proyek` | VARCHAR(200) | Lokasi proyek | "Kel. Sepaku, Kec. Sapaku, Kab. Penajam Paser Utara" |
| `pengguna_jasa` | VARCHAR(200) | Klien/pengguna jasa | "Direktorat Perencanaan Mikro, Otorita IKN" |
| `uraian_tugas` | TEXT | Deskripsi tugas | "Membantu menyusun metodologi, rencana kerja..." |
| `waktu_mulai` | VARCHAR(50) | Waktu mulai | "Agustus 2025" |
| `waktu_selesai` | VARCHAR(50) | Waktu selesai | "Desember 2025" |
| `posisi_penugasan` | VARCHAR(100) | Posisi dalam proyek | "Ahli Perencanaan Wilayah dan Kota" |
| `status_kepegawaian` | VARCHAR(50) | Status | "Tidak Tetap" / "Tetap" |
| `surat_referensi` | VARCHAR(100) | Nomor surat referensi | "10/SK/RENTEK/04/2023" atau "-" |

## 🎯 Cara Menggunakan

### Dari Frontend

1. Buka halaman **Expert**
2. Klik expert yang ingin di-generate CV-nya
3. Klik tombol **"Generate CV"**
4. Modal akan muncul menampilkan preview data
5. Klik **"Generate CV"**
6. File DOCX akan otomatis ter-download
7. **✨ SEMUA proyek** expert akan termasuk dalam CV (tidak terbatas 3 proyek)

### Dari API (Manual Testing)

```bash
# Get CV for expert ID 1
curl -X GET "http://localhost:8000/api/v1/cv/1/cv" \
  -H "accept: application/vnd.openxmlformats-officedocument.wordprocessingml.document" \
  --output CV_Expert_1.docx
```

## 🔄 Flow Diagram

```
User clicks "Generate CV"
    ↓
Frontend calls API: GET /api/v1/cv/{expert_id}/cv
    ↓
Backend loads expert data from database (ALL projects)
    ↓
Backend loads TEMPLATE_CV_EXPERT.docx
    ↓
Backend fills header table with personal info
    ↓
Backend fills first project table
    ↓
FOR EACH additional project:
    Backend duplicates project table
    Backend fills with project data
    ↓
Backend fills signature table
    ↓
Backend returns DOCX file as download
    ↓
Frontend triggers file download
    ↓
User gets CV_{ExpertName}_{Date}.docx with ALL projects
```

## � How It Works

### Replacement Strategy

**TIDAK menggunakan placeholder** seperti `{{NAMA}}`. Sebagai gantinya, kita:

1. **Membaca struktur table** yang sudah ada di template
2. **Mengganti text** di cell-cell tertentu berdasarkan posisi row
3. **Mempertahankan formatting** yang sudah ada di template

### Example Code Logic

```python
# Table 0, Row 2: Nama Personel
replace_text_in_cell(
    header_table.rows[2].cells[3], 
    'Asep Hendy Sopyandi',  # Text yang ada di template
    expert.nama              # Data dari database
)

# Table 1, Row 1: Nama Proyek
replace_text_in_cell(
    project_table.rows[1].cells[3],
    'Penyusunan Rencana Pengembangan Kawasan',  # Template text
    project.nama_proyek                          # Database data
)
```

## ⚠️ Important Notes

### 1. Template File Must NOT Be Modified
Template adalah format resmi Sucofindo. **JANGAN DIUBAH** kecuali ada perubahan resmi dari Sucofindo.

### 2. ~~Maximum 3 Projects~~ UNLIMITED Projects ✨
**UPDATE**: Versi baru mendukung UNLIMITED projects! Tabel proyek akan diduplikasi secara otomatis untuk setiap proyek yang dimiliki expert.

- Versi lama: Maksimal 3 proyek
- Versi baru (dynamic): Semua proyek akan ditampilkan

### 3. Empty Data Handling
Jika data tidak ada, akan diganti dengan `"Belum diisi"`:
```python
tempat_lahir = expert.tempat_lahir or 'Belum diisi'
```

### 4. Date Format
Format tanggal mengikuti template:
- Tanggal lahir: `"7 Juli 1967"`
- Waktu pelaksanaan: `"Agustus 2025-Desember 2025"`
- Tanggal generate: `"06 Mei 2026"`

### 5. Array Fields
Fields yang berupa array (pendidikan, bahasa) akan di-join dengan newline:
```python
pendidikan_text = "\n".join(pendidikan_formal)
# Output:
# S1 Teknik Planologi ITB
# S2 Perencanaan Wilayah UGM
```

## 🛠️ Troubleshooting

### Error: "CV template not found"
**Solusi**: Pastikan file `TEMPLATE_CV_EXPERT.docx` ada di root project.

### Error: "Failed to generate CV"
**Solusi**: 
1. Cek apakah `python-docx` sudah terinstall
2. Cek apakah template file corrupt
3. Cek log backend untuk detail error

### Data tidak muncul di CV
**Solusi**:
1. Pastikan data sudah ada di database
2. Jalankan SQL migration untuk menambahkan field baru
3. Update data expert dengan field-field yang dibutuhkan

### Format CV tidak sesuai
**Solusi**:
1. **JANGAN** edit template
2. Cek apakah ada perubahan di template yang tidak disengaja
3. Re-download template asli dari Sucofindo

## 📚 API Documentation

### Endpoint: Generate CV

**URL**: `GET /api/v1/cv/{expert_id}/cv`

**Parameters**:
- `expert_id` (path, required): ID of the expert

**Response**:
- **Success (200)**: DOCX file download
  - Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Content-Disposition: `attachment; filename=CV_{ExpertName}_{Date}.docx`

- **Error (404)**: Expert not found
  ```json
  {
    "detail": "Expert not found"
  }
  ```

- **Error (500)**: Template not found or generation failed
  ```json
  {
    "detail": "CV template not found. Please ensure TEMPLATE_CV_EXPERT.docx exists in project root."
  }
  ```

## 📦 Files Modified

1. ✅ `backend/app/models/expert.py` - Added CV template fields
2. ✅ `backend/app/api/v1/cv_generator.py` - Complete rewrite to match template
3. ✅ `backend/alembic/versions/add_cv_template_fields.py` - Alembic migration
4. ✅ `supabase/add_cv_template_fields.sql` - Supabase migration
5. ✅ `CV_TEMPLATE_GUIDE.md` - Updated documentation

## 🚀 Deployment Steps

### 1. Update Database (Supabase)
```sql
-- Run in Supabase SQL Editor
-- File: supabase/add_cv_template_fields.sql
```

### 2. Update Backend
```bash
cd backend
pip install python-docx==1.1.2
# Deploy to Railway/production
```

### 3. Test
```bash
# Test CV generation
curl -X GET "https://your-api.com/api/v1/cv/1/cv" --output test_cv.docx
```

## 📝 Next Steps

1. ✅ Database schema updated
2. ✅ CV generator rewritten to match template
3. ⏳ Frontend form untuk input data CV (optional)
4. ⏳ Bulk update existing expert data
5. ⏳ User guide untuk mengisi data CV

## 🎨 Future Enhancements

- [ ] Frontend form untuk edit CV data
- [ ] Preview CV sebelum download
- [ ] Multiple template support (jika ada format lain)
- [ ] Batch CV generation untuk multiple experts
- [ ] CV history/versioning

## ✨ NEW: Dynamic Project Tables (v2.0)

### Fitur Baru
- **Unlimited Projects**: Tidak ada batasan jumlah proyek
- **Auto-Duplicate**: Tabel proyek diduplikasi otomatis
- **Preserve Formatting**: Semua formatting (border, font, spacing) dipertahankan
- **Same Template**: Menggunakan template yang sama, tidak perlu template baru

### Cara Kerja
1. Template memiliki 1 tabel proyek (Table 1)
2. Tabel ini diisi dengan proyek pertama
3. Untuk proyek ke-2, 3, 4, dst: tabel diduplikasi
4. Setiap duplikat diisi dengan data proyek masing-masing

### Contoh Output

**Expert dengan 1 proyek:**
```
[Header Table]
[Project 1 Table]
[Signature Table]
```

**Expert dengan 5 proyek:**
```
[Header Table]
[Project 1 Table]
[Project 2 Table] ← Diduplikasi
[Project 3 Table] ← Diduplikasi
[Project 4 Table] ← Diduplikasi
[Project 5 Table] ← Diduplikasi
[Signature Table]
```

### Migration dari v1.0 ke v2.0

**v1.0 (Old - Limited to 3 projects):**
```python
# backend/app/api/v1/cv_generator.py
projects = expert.projects[:3]  # ❌ Max 3 projects
```

**v2.0 (New - Unlimited projects):**
```python
# backend/app/api/v1/cv_generator_dynamic.py
projects = expert.projects  # ✅ ALL projects

# Duplicate table for each project
for i in range(1, len(projects)):
    new_table = copy.deepcopy(first_project_table._element)
    parent.insert(position, new_table)
    fill_project_table(new_table, projects[i], i+1)
```

### Technical Details

**Table Duplication:**
```python
# Get first project table
first_project_table = doc.tables[1]
table_element = first_project_table._element

# Deep copy the table structure
new_table_element = copy.deepcopy(table_element)

# Insert into document
parent = table_element.getparent()
parent.insert(position, new_table_element)

# Create Table object and fill with data
new_table = Table(new_table_element, doc)
fill_project_table(new_table, project_data, project_num)
```

**Placeholder Replacement:**
```python
def fill_project_table(table, project, project_num):
    replacements = {
        '{Nama Proyek}': project.get('nama_proyek', ''),
        '{Lokasi Proyek}': project.get('lokasi_proyek', ''),
        # ... more fields
    }
    
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                replace_in_paragraph(paragraph, replacements)
```
