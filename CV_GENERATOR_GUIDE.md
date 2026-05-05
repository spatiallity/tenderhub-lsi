# Panduan Generator CV Tenaga Ahli

## Fitur yang Sudah Diimplementasi

Generator CV Tenaga Ahli telah ditambahkan ke halaman Expert dengan fitur:

### ✅ Sudah Tersedia

1. **Dual Format Output** ⭐ NEW
   - **DOCX**: Format editable untuk revisi manual
   - **PDF**: Format print-ready untuk submission
   - Toggle selector di footer modal
   - Auto-download dengan nama `CV_[Nama]_[Tahun].[format]`

2. **Data Pribadi** (Lengkap)
   - Nama, tempat/tanggal lahir, agama, jenis kelamin
   - Status perkawinan, alamat KTP & domisili
   - NIK, NPWP, kewarganegaraan
   - No. telepon dan email

2. **Pendidikan** (Lengkap)
   - Multi-jenjang (S3, S2, S1, D4, D3, SMA, SMK)
   - Tanggal lulus, fakultas/jurusan
   - Nama perguruan tinggi, IPK
   - Bisa tambah/hapus entry

3. **Pengalaman Kerja** (Lengkap)
   - Auto-populate dari riwayat expert
   - Nama instansi, nama proyek, posisi
   - Tingkat wilayah, periode kerja
   - Lama bekerja (tahun & bulan)
   - Nilai kontrak, uraian tugas
   - Bisa tambah/hapus entry

4. **Kemampuan Bahasa** (Lengkap)
   - Nama bahasa
   - Kemampuan lisan & tulisan (Pasif/Aktif/Sangat Aktif)
   - Bisa tambah/hapus entry

5. **Output DOCX**
   - Format sesuai standar LKPP
   - Font Times New Roman 11pt
   - Tabel dengan border tipis (#CCCCCC)
   - Margin A4 standar (3cm kiri, 2.5cm lainnya)
   - Editable setelah download
   - Auto-download dengan nama `CV_[Nama]_[Tahun].docx`

6. **Output PDF** ⭐ NEW
   - Format print-ready
   - Font Times New Roman 11pt
   - Tabel dengan border tipis
   - Margin A4 standar
   - Auto page break untuk konten panjang
   - Auto-download dengan nama `CV_[Nama]_[Tahun].pdf`

### 🚧 Belum Tersedia (Placeholder)

- Sertifikasi & Keahlian
- Pelatihan & Pendidikan Non-Formal
- Organisasi Profesi
- Referensi
- Upload foto 3x4

## Cara Menggunakan

1. **Buka halaman Experts** (`/experts`)
2. **Klik salah satu expert** untuk membuka detail panel
3. **Klik tombol "Generate CV"** di pojok kanan atas header
4. **Isi form** dengan navigasi tab:
   - **Data Pribadi**: Isi semua field yang wajib (*)
   - **Pendidikan**: Tambah jenjang pendidikan (S3 → S1 → SMA)
   - **Pengalaman**: Sudah auto-populate dari riwayat, bisa edit/tambah
   - **Bahasa**: Tambah kemampuan bahasa
5. **Pilih format output** di footer modal:
   - **DOCX** (biru): File editable untuk revisi
   - **PDF** (merah): File print-ready untuk submission
6. **Klik "Generate DOCX/PDF"** untuk download file

## Format Output

Dokumen CV mengikuti format resmi pengadaan pemerintah dan tersedia dalam 2 format:

### 📄 DOCX (Editable)
- Dapat diedit setelah download
- Cocok untuk revisi manual
- Format Microsoft Word Open XML
- Semua styling tetap terjaga

### 📕 PDF (Print-Ready)
- Siap print atau submit
- Tidak dapat diedit (final)
- Format portable, bisa dibuka di semua device
- Auto page break untuk konten panjang

### Struktur Dokumen (Sama untuk DOCX & PDF)

```
CURRICULUM VITAE
├── DATA PRIBADI (tabel 3 kolom: Label | : | Nilai)
├── LATAR BELAKANG PENDIDIKAN (tabel dengan separator antar jenjang)
├── RINGKASAN PENGALAMAN KERJA (tabel 6 kolom dengan header)
├── URAIAN PENGALAMAN KERJA (tabel detail per proyek)
├── KEMAMPUAN BAHASA (tabel 4 kolom dengan header)
└── PERNYATAAN & TANDA TANGAN
```

### Spesifikasi Teknis

- **Ukuran Kertas**: A4 (21 x 29.7 cm)
- **Margin**: Atas 2.5cm, Bawah 2.5cm, Kiri 3cm, Kanan 2.5cm
- **Font**: Times New Roman, 11pt
- **Border Tabel**: Single, 1pt, warna #CCCCCC
- **Separator**: Shading #D9D9D9 untuk pemisah antar entry
- **Format Tanggal**: "DD Bulan YYYY" (contoh: "6 Oktober 1974")
- **Format Mata Uang**: "Rp 1.000.000" (titik sebagai pemisah ribuan)

## Teknologi

- **DOCX Generator**: `docx` v8.x untuk generate Microsoft Word documents
- **PDF Generator**: `jspdf` + `jspdf-autotable` untuk generate PDF documents
- **File Saver**: `file-saver` untuk download files
- **Format Output**: 
  - `.docx` - Microsoft Word Open XML (editable)
  - `.pdf` - Portable Document Format (print-ready)

## Pengembangan Selanjutnya

### Priority 1 (Essential)
- [ ] Upload foto 3x4 cm
- [ ] Form sertifikasi & keahlian
- [ ] Form referensi (max 3)

### Priority 2 (Nice to Have)
- [ ] Form pelatihan non-formal
- [ ] Form organisasi profesi
- [ ] Preview CV sebelum download
- [ ] ~~Export ke PDF~~ ✅ DONE
- [ ] Template CV alternatif
- [ ] Auto-save draft ke localStorage

### Priority 3 (Advanced)
- [ ] Import data dari LinkedIn
- [ ] Bulk generate CV untuk multiple experts
- [ ] Custom branding (logo perusahaan)
- [ ] Multi-language support

## File yang Diubah/Ditambah

```
frontend/
├── src/
│   ├── utils/
│   │   ├── cvGenerator.js (NEW - DOCX generator)
│   │   └── cvGeneratorPDF.js (NEW - PDF generator)
│   └── components/
│       └── Expert/
│           ├── CVGeneratorModal.jsx (NEW - with format selector)
│           └── ExpertDetail.jsx (MODIFIED - added CV button)
└── package.json (MODIFIED - added docx, file-saver, jspdf)
```

## Troubleshooting

### CV tidak ter-download
- Pastikan browser tidak memblokir download
- Cek console untuk error
- Pastikan semua field wajib (*) sudah diisi

### Format tanggal salah
- Gunakan format `YYYY-MM-DD` di input date
- Generator akan otomatis convert ke format Indonesia

### Tabel terpotong saat print PDF
- Pastikan margin printer sesuai (3cm kiri, 2.5cm lainnya)
- Gunakan print preview sebelum print fisik
- PDF sudah auto page break, tapi cek preview dulu

### Perbedaan DOCX vs PDF
- **DOCX**: Bisa diedit, cocok untuk revisi
- **PDF**: Tidak bisa diedit, cocok untuk submission final
- Keduanya punya format yang sama, pilih sesuai kebutuhan

### Font tidak sesuai di PDF
- jsPDF menggunakan font default browser
- Times New Roman akan fallback ke serif font
- Untuk hasil terbaik, gunakan DOCX lalu convert ke PDF manual

## Referensi

- Prompt lengkap: `PROMPT_CV_TENAGA_AHLI.md`
- Library docx: https://docx.js.org/
- Format LKPP: Standar dokumen pengadaan pemerintah Indonesia
