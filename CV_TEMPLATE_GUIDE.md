# CV Template Guide - TenderHub LSI

## 📄 Overview

Fitur Generate CV menggunakan template DOCX (`TEMPLATE_CV_EXPERT.docx`) yang sudah ada di root project. Template ini akan diisi otomatis dengan data expert dari database.

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
├── TEMPLATE_CV_EXPERT.docx  ← Template file
├── backend/
├── frontend/
└── ...
```

## 📝 Placeholders dalam Template

Template DOCX harus menggunakan placeholder berikut (case-sensitive):

### Data Pribadi
- `{{NAMA}}` - Nama lengkap expert
- `{{NO_HP}}` - Nomor telepon
- `{{INSTANSI}}` - Nama instansi/afiliasi
- `{{KEAHLIAN}}` - Daftar keahlian (comma-separated)
- `{{AVAILABILITY}}` - Status ketersediaan (Tersedia/Sedang Bertugas/Tidak Tersedia)
- `{{RATING}}` - Rating expert (format: 4.8/5.0)
- `{{JUMLAH_PROYEK}}` - Jumlah proyek yang pernah dikerjakan
- `{{TANGGAL_GENERATE}}` - Tanggal CV di-generate (format: 06 Mei 2026)

### Riwayat Proyek (dalam tabel)

Untuk setiap proyek (maksimal 10 proyek):
- `{{PROYEK_1}}` - Nama proyek #1
- `{{KLIEN_1}}` - Pemberi kerja #1
- `{{TAHUN_1}}` - Tahun pelaksanaan #1
- `{{NILAI_1}}` - Nilai kontrak #1 (format: Rp 3.200.000.000)
- `{{PERAN_1}}` - Peran dalam proyek #1
- `{{STATUS_1}}` - Status proyek #1 (Selesai/Aktif)

Dan seterusnya untuk `{{PROYEK_2}}`, `{{PROYEK_3}}`, ... sampai `{{PROYEK_10}}`

## 📋 Contoh Struktur Template

```
CURRICULUM VITAE

Nama: {{NAMA}}
No. HP: {{NO_HP}}
Instansi: {{INSTANSI}}
Keahlian: {{KEAHLIAN}}
Status: {{AVAILABILITY}}
Rating: {{RATING}}
Jumlah Proyek: {{JUMLAH_PROYEK}}

RIWAYAT PROYEK

| No | Nama Proyek | Pemberi Kerja | Tahun | Nilai Kontrak | Peran | Status |
|----|-------------|---------------|-------|---------------|-------|--------|
| 1  | {{PROYEK_1}} | {{KLIEN_1}} | {{TAHUN_1}} | {{NILAI_1}} | {{PERAN_1}} | {{STATUS_1}} |
| 2  | {{PROYEK_2}} | {{KLIEN_2}} | {{TAHUN_2}} | {{NILAI_2}} | {{PERAN_2}} | {{STATUS_2}} |
...

Tanggal Generate: {{TANGGAL_GENERATE}}
```

## 🎯 Cara Menggunakan

### Dari Frontend

1. Buka halaman **Expert**
2. Klik expert yang ingin di-generate CV-nya
3. Klik tombol **"Generate CV"**
4. Modal akan muncul menampilkan preview data
5. Klik **"Generate CV"**
6. File DOCX akan otomatis ter-download

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
Backend loads expert data from database
    ↓
Backend loads TEMPLATE_CV_EXPERT.docx
    ↓
Backend replaces all placeholders with actual data
    ↓
Backend returns DOCX file as download
    ↓
Frontend triggers file download
    ↓
User gets CV_{ExpertName}_{Date}.docx
```

## 📊 Data Mapping

| Database Field | Template Placeholder | Format |
|----------------|---------------------|--------|
| `nama` | `{{NAMA}}` | String |
| `no_hp` | `{{NO_HP}}` | String |
| `instansi` | `{{INSTANSI}}` | String |
| `keahlian` (array) | `{{KEAHLIAN}}` | Comma-separated |
| `availability` | `{{AVAILABILITY}}` | String |
| `rating_avg` | `{{RATING}}` | "4.8/5.0" |
| `jumlah_proyek` | `{{JUMLAH_PROYEK}}` | Number |
| `projects[0].nama_proyek` | `{{PROYEK_1}}` | String |
| `projects[0].pemberi_kerja` | `{{KLIEN_1}}` | String |
| `projects[0].tahun` | `{{TAHUN_1}}` | Number |
| `projects[0].nilai_proyek` | `{{NILAI_1}}` | "Rp 3.200.000.000" |
| `projects[0].peran` | `{{PERAN_1}}` | String |
| `projects[0].status_proyek` | `{{STATUS_1}}` | String |

## ⚠️ Important Notes

### 1. Template File Must Exist
Jika template tidak ditemukan, API akan return error:
```json
{
  "detail": "CV template not found. Please ensure TEMPLATE_CV_EXPERT.docx exists in project root."
}
```

### 2. Placeholder Case-Sensitive
Placeholder harus **UPPERCASE** dan dalam double curly braces:
- ✅ `{{NAMA}}`
- ❌ `{{nama}}`
- ❌ `{NAMA}`
- ❌ `{{Nama}}`

### 3. Maximum 10 Projects
Hanya 10 proyek pertama yang akan di-include dalam CV. Jika expert punya lebih dari 10 proyek, yang lain akan diabaikan.

### 4. Empty Placeholders
Jika data tidak ada (misalnya `no_hp` kosong), placeholder akan diganti dengan string kosong `""`.

### 5. Currency Formatting
Nilai kontrak otomatis diformat ke Rupiah:
- Input: `3200000000`
- Output: `Rp 3.200.000.000`

## 🛠️ Troubleshooting

### Error: "CV template not found"
**Solusi**: Pastikan file `TEMPLATE_CV_EXPERT.docx` ada di root project (sejajar dengan folder `backend` dan `frontend`).

### Error: "Failed to generate CV"
**Solusi**: 
1. Cek apakah `python-docx` sudah terinstall: `pip list | grep python-docx`
2. Cek apakah template file corrupt (coba buka manual di Word)
3. Cek log backend untuk detail error

### Placeholder tidak ter-replace
**Solusi**:
1. Pastikan placeholder menggunakan **UPPERCASE**
2. Pastikan menggunakan **double curly braces** `{{...}}`
3. Cek apakah ada spasi di dalam placeholder (harus `{{NAMA}}` bukan `{{ NAMA }}`)

### File download tapi corrupt
**Solusi**:
1. Pastikan `responseType: 'blob'` ada di frontend API call
2. Cek apakah template file asli tidak corrupt
3. Restart backend server

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

## 🎨 Customizing Template

Untuk mengubah format CV:

1. Buka `TEMPLATE_CV_EXPERT.docx` di Microsoft Word
2. Edit layout, font, warna, dll sesuai kebutuhan
3. **Jangan hapus placeholder** `{{...}}`
4. Save template
5. Test generate CV untuk memastikan placeholder masih berfungsi

## 📦 Files Modified

1. ✅ `backend/app/api/v1/cv_generator.py` - New API endpoint
2. ✅ `backend/app/main.py` - Include cv_generator router
3. ✅ `backend/requirements.txt` - Add python-docx
4. ✅ `frontend/src/components/Expert/CVGeneratorModal.jsx` - Simplified UI
5. ✅ `CV_TEMPLATE_GUIDE.md` - This documentation

## 🚀 Next Steps

1. Install python-docx: `pip install python-docx==1.1.2`
2. Pastikan `TEMPLATE_CV_EXPERT.docx` ada di root project
3. Restart backend server
4. Test generate CV dari frontend
5. Customize template sesuai kebutuhan
