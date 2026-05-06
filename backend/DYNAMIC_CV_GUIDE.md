# Dynamic CV Generation - Unlimited Projects

## 🎯 Fitur Baru

Script `generate_cv_dynamic.py` memungkinkan CV untuk menampilkan **SEMUA proyek** yang dimiliki expert, tidak terbatas hanya 3 proyek seperti sebelumnya.

## 🔧 Cara Kerja

### 1. Template Structure
Template `TEMPLATE_CV_EXPERT.docx` memiliki struktur:
- **Table 0**: Header (info personal, pendidikan, bahasa)
- **Table 1**: Proyek pertama (template)
- **Table N**: Signature

### 2. Dynamic Table Duplication

Ketika expert memiliki lebih dari 1 proyek:

```python
# Proyek 1: Gunakan tabel yang sudah ada di template
fill_project_table(first_project_table, projects[0], 1)

# Proyek 2, 3, 4, dst: Duplikasi tabel proyek pertama
for i in range(1, len(projects)):
    new_table = copy.deepcopy(first_project_table._element)
    parent.insert(position, new_table)
    fill_project_table(new_table, projects[i], i+1)
```

### 3. Hasil

Jika expert punya 5 proyek, CV akan memiliki:
- 1 tabel header
- 5 tabel proyek (diduplikasi dari template)
- 1 tabel signature

## 📋 Struktur Tabel Proyek

Setiap tabel proyek berisi:

| Field | Placeholder | Source |
|-------|-------------|--------|
| Tahun | `{Tahun Awal Proyek 1}` – `{Tahun Akhir Proyek 1}` | `waktu_mulai`, `waktu_selesai` |
| Nama Proyek | `{Nama Proyek}` | `nama_proyek` |
| Lokasi | `{Lokasi Proyek}` | `lokasi_proyek` |
| Pengguna Jasa | `{Nama Klien}` | `pengguna_jasa` atau `pemberi_kerja` |
| Nama Perusahaan | `{Nama Perusahaan Tempat Tenaga Ahli Di Hire}` | `nama_perusahaan_lain` atau `bersama` |
| Uraian Tugas | `{Uraian deskripsi pekerjaan 1}` | `uraian_tugas` |
| Waktu Pelaksanaan | `{Bulan Awal, Tahun}` – `{Bulan Akhir, Tahun}` | `waktu_mulai`, `waktu_selesai` |
| Posisi | `{Posisi Penugasan}` | `posisi_penugasan` atau `peran` |
| Status | `{Status Kepegawaian}` | `status_kepegawaian` |
| Referensi | `{Nomor Surat Referensi}` | `surat_referensi` |

## 🚀 Penggunaan

### Via Script (Manual)

```bash
cd backend
python generate_cv_dynamic.py
```

### Via API (Recommended)

Update endpoint `/api/v1/cv/{expert_id}/cv` untuk menggunakan fungsi dynamic:

```python
from app.api.v1.cv_generator_dynamic import generate_cv_from_template

@router.get("/{expert_id}/cv")
async def generate_expert_cv(expert_id: int, db: Session = Depends(get_db)):
    # ... existing code ...
    
    # Use dynamic generator instead
    output_path = f"CV_{expert.nama}_{datetime.now().strftime('%Y%m%d')}.docx"
    generate_cv_from_template(expert_id, template_path, output_path)
    
    return FileResponse(output_path, ...)
```

## 📊 Contoh Output

### Expert dengan 2 Proyek:
```
[Header Table]
[Project 1 Table]
[Project 2 Table]  ← Ditambahkan otomatis
[Signature Table]
```

### Expert dengan 5 Proyek:
```
[Header Table]
[Project 1 Table]
[Project 2 Table]  ← Ditambahkan otomatis
[Project 3 Table]  ← Ditambahkan otomatis
[Project 4 Table]  ← Ditambahkan otomatis
[Project 5 Table]  ← Ditambahkan otomatis
[Signature Table]
```

## ⚙️ Konfigurasi

### Mengubah Expert ID
Edit di `generate_cv_dynamic.py`:
```python
expert_id = 730  # Ganti dengan ID expert yang diinginkan
```

### Mengubah Template Path
```python
template_path = "../TEMPLATE_CV_EXPERT.docx"  # Path relatif dari backend/
```

## 🔍 Debugging

### Cek Jumlah Proyek
```python
print(f"Total projects: {len(expert.get('projects', []))}")
```

### Cek Tabel yang Dibuat
```python
print(f"Total tables in document: {len(doc.tables)}")
```

### Verifikasi Data Proyek
```python
for i, project in enumerate(projects, 1):
    print(f"Project {i}: {project.get('nama_proyek')}")
```

## ⚠️ Catatan Penting

1. **Template Harus Utuh**: Jangan hapus tabel proyek pertama dari template
2. **Formatting Preserved**: Duplikasi mempertahankan semua formatting (border, font, spacing)
3. **Order Matters**: Proyek ditampilkan sesuai urutan di database
4. **No Limit**: Tidak ada batasan jumlah proyek yang bisa ditambahkan

## 🔄 Migration dari Versi Lama

### Versi Lama (Max 3 Projects)
```python
# generate_cv_final.py
for proj_idx in range(3):  # ❌ Terbatas 3 proyek
    if proj_idx < len(projects):
        # Fill project data
```

### Versi Baru (Unlimited Projects)
```python
# generate_cv_dynamic.py
for i in range(len(projects)):  # ✅ Semua proyek
    new_table = copy.deepcopy(first_project_table)
    fill_project_table(new_table, projects[i], i+1)
```

## 📦 Dependencies

```bash
pip install python-docx==1.1.2
```

## 🎨 Customization

### Menambahkan Field Baru
Edit fungsi `fill_project_table()`:
```python
replacements = {
    # ... existing fields ...
    '{Field Baru}': project.get('field_baru', 'Default Value'),
}
```

### Mengubah Format Tanggal
```python
waktu_mulai = datetime.strptime(project['waktu_mulai'], '%B %Y')
formatted = waktu_mulai.strftime('%m/%Y')
```

## 🧪 Testing

### Test dengan Expert yang Punya Banyak Proyek
```bash
# Expert ID 730 punya 3 proyek
python generate_cv_dynamic.py

# Hasilnya: CV dengan 3 tabel proyek
```

### Verifikasi Output
1. Buka file DOCX yang dihasilkan
2. Cek jumlah tabel proyek = jumlah proyek di database
3. Verifikasi data di setiap tabel terisi dengan benar

## 🚀 Next Steps

1. ✅ Script dynamic CV generator dibuat
2. ⏳ Integrate ke API endpoint
3. ⏳ Update frontend untuk handle unlimited projects
4. ⏳ Add pagination/limit di preview (jika perlu)
5. ⏳ Test dengan expert yang punya 10+ proyek

## 📝 Changelog

### v2.0 - Dynamic Tables (Current)
- ✅ Support unlimited projects
- ✅ Auto-duplicate project tables
- ✅ Preserve formatting
- ✅ Maintain template structure

### v1.0 - Fixed Tables
- ❌ Limited to 3 projects only
- ✅ Basic placeholder replacement
