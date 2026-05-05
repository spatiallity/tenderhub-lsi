# Panduan Tambah Tenaga Ahli dengan Data CV

## ✨ Fitur Baru

Form penambahan tenaga ahli sekarang sudah terintegrasi dengan data CV. Anda bisa langsung mengisi data CV lengkap saat menambah expert baru, atau cukup isi nama dan instansi saja (minimal).

## 🎯 Keunggulan

### 1. **Flexible Input**
- **Wajib**: Hanya nama dan instansi
- **Opsional**: Semua data CV lainnya
- Bisa diisi nanti via "Generate CV"

### 2. **Accordion Sections**
- 📋 **Informasi Dasar** (Wajib) - Selalu terbuka
- 📄 **Data CV** (Opsional) - Collapsed by default
- 🎓 **Pendidikan** (Opsional) - Collapsed by default
- 💼 **Pengalaman Kerja** (Opsional) - Collapsed by default
- 🌐 **Kemampuan Bahasa** (Opsional) - Collapsed by default

### 3. **Data Persistence**
- Data CV tersimpan di field `cvData` expert
- Auto-populate saat generate CV
- Tidak perlu isi ulang setiap kali generate

### 4. **Smart Mapping**
- Pengalaman kerja → Auto convert ke `history` format
- Data CV → Tersimpan terpisah untuk CV generator
- Nama & instansi → Langsung ke profil expert

## 📋 Cara Menggunakan

### Opsi 1: Minimal (Cepat)
1. Klik **"Tambah Tenaga Ahli"**
2. Isi **Nama** dan **Instansi** (wajib)
3. Isi keahlian, portfolio, availability (opsional)
4. Klik **"Simpan Tenaga Ahli"**
5. ✅ Expert tersimpan, data CV bisa diisi nanti

### Opsi 2: Lengkap (Sekali Jalan)
1. Klik **"Tambah Tenaga Ahli"**
2. Isi **Informasi Dasar** (nama, instansi wajib)
3. Expand **"Data CV"** → Isi data pribadi lengkap
4. Expand **"Pendidikan"** → Tambah jenjang pendidikan
5. Expand **"Pengalaman Kerja"** → Tambah riwayat pekerjaan
6. Expand **"Kemampuan Bahasa"** → Tambah bahasa
7. Klik **"Simpan Tenaga Ahli"**
8. ✅ Expert tersimpan dengan data CV lengkap

## 🔄 Flow Data

```
Form Tambah Expert
├── Informasi Dasar → expert.nama, expert.instansi, expert.noHp
├── Data CV → expert.cvData.{tempatLahir, tanggalLahir, ...}
├── Pendidikan → expert.cvData.pendidikan[]
├── Pengalaman → expert.cvData.pengalamanKerja[] + expert.history[]
└── Bahasa → expert.cvData.bahasa[]

Generate CV
├── Load from expert.cvData (jika ada)
├── Fallback to expert.history (untuk pengalaman)
└── User bisa edit sebelum generate
```

## 💡 Keuntungan

### Untuk User
- **Tidak perlu isi ulang** data CV setiap kali generate
- **Fleksibel**: Bisa isi minimal dulu, lengkapi nanti
- **Terorganisir**: Data CV terpisah dari profil expert

### Untuk Developer
- **Clean separation**: `cvData` vs profil expert
- **Backward compatible**: Expert lama tetap bisa generate CV
- **Extensible**: Mudah tambah field CV baru

## 📊 Struktur Data Expert

```javascript
{
  // Profil Expert (Required)
  id: 1,
  nama: "Ahmad Dimyati",
  instansi: "PT Sucofindo",
  noHp: "08123456789",
  keahlian: ["Survei Topografi", "GIS"],
  portfolio: "SDA",
  availability: "Tersedia",
  
  // Riwayat (Auto-generated from pengalamanKerja)
  history: [
    {
      proyek: "Survei Topografi SUTT",
      klien: "PLN",
      tahun: "2024",
      peran: "Team Leader",
      nilai: 500000000,
      bersama: "Sucofindo",
      status: "Selesai"
    }
  ],
  
  // Data CV (Optional, for CV generation)
  cvData: {
    // Data Pribadi
    tempatLahir: "Jakarta",
    tanggalLahir: "1985-05-15",
    agama: "Islam",
    jenisKelamin: "Laki-laki",
    statusPerkawinan: "Menikah",
    alamatKTP: "Jl. Sudirman No. 123",
    alamatDomisili: "Jl. Sudirman No. 123",
    nikKTP: "3174012345678901",
    noNPWP: "12.345.678.9-012.000",
    kewarganegaraan: "Indonesia",
    email: "ahmad@sucofindo.co.id",
    
    // Pendidikan
    pendidikan: [
      {
        jenjang: "S1",
        tanggalLulus: "2008",
        fakultasJurusan: "Teknik Geodesi",
        namaPerguruanTinggi: "ITB",
        ipk: "3.75"
      }
    ],
    
    // Pengalaman Kerja (Detail)
    pengalamanKerja: [
      {
        namaInstansi: "PLN",
        namaProyek: "Survei Topografi SUTT",
        posisi: "Team Leader",
        tingkatWilayah: "Nasional",
        tanggalMulai: "2024-01-01",
        tanggalSelesai: "2024-12-31",
        lamaBekerjaTahun: 1,
        lamaBekerjaBulan: 0,
        nilaiKontrak: 500000000,
        uraianTugas: "Memimpin tim survei..."
      }
    ],
    
    // Bahasa
    bahasa: [
      {
        bahasa: "Indonesia",
        kemampuanLisan: "Sangat Aktif",
        kemampuanTulisan: "Sangat Aktif"
      },
      {
        bahasa: "Inggris",
        kemampuanLisan: "Aktif",
        kemampuanTulisan: "Aktif"
      }
    ]
  }
}
```

## 🎨 UI Features

### Accordion Behavior
- **Informasi Dasar**: Selalu terbuka (required)
- **Sections Opsional**: Collapsed by default
- Click header untuk expand/collapse
- Icon chevron menunjukkan state

### Visual Indicators
- **Biru**: Section wajib (Informasi Dasar)
- **Abu-abu**: Section opsional
- **Merah asterisk (*)**: Field wajib
- **Emoji**: Visual cue untuk setiap section

### Responsive
- Mobile: 1 kolom
- Tablet: 2 kolom
- Desktop: 3 kolom (untuk Informasi Dasar)

## 🔧 Technical Details

### Files Modified/Created
```
frontend/src/
├── components/Expert/
│   ├── AddExpertForm.jsx (NEW)
│   └── CVGeneratorModal.jsx (MODIFIED - load from cvData)
└── pages/
    └── ExpertPage.jsx (MODIFIED - use AddExpertForm)
```

### Key Changes
1. **AddExpertForm.jsx**: New component with accordion sections
2. **CVGeneratorModal.jsx**: Load from `expert.cvData` if available
3. **ExpertPage.jsx**: Use new form component

### Data Flow
```
AddExpertForm
  ↓ (onSave)
addExpert(expertData)
  ↓
Backend/Store
  ↓
Expert with cvData
  ↓ (when Generate CV)
CVGeneratorModal
  ↓ (pre-filled)
Generate DOCX/PDF
```

## 📝 Example Usage

### Scenario 1: Quick Add
```
User: Tambah expert baru
1. Nama: "Budi Santoso"
2. Instansi: "PT Surveyor Indonesia"
3. [Simpan]
✅ Expert tersimpan, CV bisa diisi nanti
```

### Scenario 2: Complete Add
```
User: Tambah expert dengan data lengkap
1. Informasi Dasar: Nama, Instansi, HP, Keahlian
2. Data CV: Tempat lahir, tanggal lahir, alamat, dll
3. Pendidikan: S1 Teknik Geodesi ITB
4. Pengalaman: 3 proyek terakhir
5. Bahasa: Indonesia, Inggris
6. [Simpan]
✅ Expert tersimpan dengan data CV lengkap
```

### Scenario 3: Generate CV
```
User: Generate CV untuk expert yang sudah ada
1. Klik expert → "Generate CV"
2. Form sudah pre-filled dari cvData
3. Edit jika perlu
4. Pilih format (DOCX/PDF)
5. [Generate]
✅ CV ter-download dengan data lengkap
```

## 🚀 Benefits

### Time Saving
- **Tidak perlu isi ulang** setiap kali generate CV
- **Pre-filled form** saat generate CV
- **Batch input** saat tambah expert baru

### Data Quality
- **Konsisten**: Data tersimpan di satu tempat
- **Lengkap**: Bisa isi semua data sekaligus
- **Terstruktur**: Accordion memudahkan navigasi

### User Experience
- **Fleksibel**: Minimal atau lengkap, terserah user
- **Intuitif**: Accordion dengan emoji dan label jelas
- **Responsive**: Bekerja di semua device

---

**Fitur sudah live!** Coba tambah expert baru di halaman Tenaga Ahli. 🎉
