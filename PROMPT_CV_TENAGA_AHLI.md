# PROMPT LENGKAP: Generator CV Tenaga Ahli Proyek Pemerintah

## KONTEKS
Buat aplikasi/fitur generator CV Tenaga Ahli untuk proyek pemerintah Indonesia
(pengadaan jasa konsultansi) yang menghasilkan dokumen DOCX dengan format tabel
resmi sesuai standar dokumen pengadaan LKPP.

---

## REFERENSI FORMAT VISUAL

Format CV mengacu pada dokumen resmi dengan struktur berikut:

### HALAMAN 1 - Layout Keseluruhan:
- Judul dokumen: "CURRICULUM VITAE" — posisi CENTER, bold, font Times New Roman 12pt
- Foto 3x4 cm ditempatkan di pojok KANAN ATAS, sejajar dengan baris pertama tabel Data Pribadi
- Semua konten menggunakan tabel tanpa border luar yang tebal — border tipis abu-abu (#CCCCCC)
- Margin halaman: atas 2.5cm, bawah 2.5cm, kiri 3cm, kanan 2.5cm
- Ukuran kertas: A4
- Font: Times New Roman, 11pt untuk isi tabel

### STRUKTUR TABEL UMUM (berlaku untuk semua seksi):
- Setiap seksi diawali dengan JUDUL SEKSI berformat: teks bold, underline, huruf kapital semua
  Contoh: "DATA PRIBADI", "LATAR BELAKANG PENDIDIKAN", "RINGKASAN PENGALAMAN KERJA"
- Judul seksi BUKAN header tabel — melainkan paragraf tersendiri di atas tabel
- Spasi antara judul seksi dan tabel: 0pt before, 6pt after
- Spasi antar seksi (jarak antara akhir tabel satu dengan judul seksi berikutnya): 12pt

---

## SEKSI 1: DATA PRIBADI

### Layout Tabel:
- 3 kolom: [Label | Titik Dua | Nilai]
- Lebar kolom: 4.5cm | 0.5cm | sisa halaman
- Tidak ada header baris
- Semua border: SINGLE, 1pt, warna #CCCCCC
- Row height: auto (wrap text)
- Shading baris: tidak ada (semua putih)

### Daftar Baris (urutan harus persis):
1. Nama Lengkap
2. Tempat, Tanggal Lahir
3. Agama
4. Jenis Kelamin
5. Status Perkawinan
6. Alamat Rumah Sesuai KTP
7. Alamat Domisili
8. NIK KTP
9. No. NPWP
10. Kewarganegaraan
11. No. Telepon/HP
12. Alamat Email

### Tata letak Foto:
- Foto diletakkan sebagai floating image atau dalam sel tabel terpisah di sisi kanan
- Ukuran foto: lebar 3cm, tinggi 4cm
- Posisi: sejajar baris pertama "Nama Lengkap", rata kanan halaman
- Jika menggunakan tabel untuk foto: buat tabel 2 kolom —
  kolom kiri = tabel Data Pribadi (lebar ~14cm), kolom kiri = foto (lebar 3.5cm)
- Border sel foto: SINGLE tipis

---

## SEKSI 2: LATAR BELAKANG PENDIDIKAN

### Layout Tabel:
- 3 kolom: [Label | Titik Dua | Nilai]
- Lebar kolom: sama dengan seksi Data Pribadi
- Setiap jenjang pendidikan dipisahkan dengan baris abu-abu (shading #D9D9D9) berisi teks kosong
  sebagai pemisah visual antar jenjang

### Urutan field per jenjang (diulang untuk S2, S1, D3, dst.):
1. Jenjang Pendidikan (isi: S2 / S1 / D3 / SMA / dst.)
2. Tanggal Kelulusan
3. Fakultas/Jurusan
4. Nama Perguruan Tinggi
5. IPK

### Catatan:
- Jenjang pendidikan dimulai dari yang TERTINGGI (S2/S3) ke yang terendah
- Baris pemisah antar jenjang menggunakan ShadingType.CLEAR dengan fill #D9D9D9
- Jika data kosong, isi nilai dengan tanda " - "

---

## SEKSI 3: RINGKASAN PENGALAMAN KERJA

### Layout Tabel:
- Ini adalah tabel dengan HEADER ROW (baris judul kolom)
- 5 kolom dengan lebar proporsional:
  - No: 1cm
  - Nama Instansi/Lembaga/Program: 5.5cm
  - Posisi: 4cm
  - Tingkat Wilayah: 2.5cm
  - Waktu: 2cm
  - Lama Bekerja: 2.5cm

  (Total ~17.5cm disesuaikan dengan content width A4 margin 3cm/2.5cm)

### Format Header Row:
- Background/shading: putih (tidak ada fill)
- Teks: bold, center, Times New Roman 11pt
- Border: SINGLE #CCCCCC semua sisi
- Baris header TIDAK digabung — setiap kolom berdiri sendiri

### Format Baris Data:
- Nomor urut: center, angka biasa (1, 2, 3...)
- Nama Instansi: rata kiri, wrap text, bold untuk nama instansi utama
- Posisi: rata kiri, wrap text
- Tingkat Wilayah: center (Nasional / Provinsi / Kabupaten / Kota)
- Waktu: center, format "X Tahun Y Bulan"
- Lama Bekerja: center, format tanggal "DD Bulan YYYY - DD Bulan YYYY" atau "Sekarang"

### Catatan:
- Urutkan dari pengalaman TERBARU ke terlama
- Setiap baris harus memiliki tinggi minimum yang cukup untuk wrap text
- Tidak ada row shading alternating — semua baris putih

---

## SEKSI 4: URAIAN PENGALAMAN KERJA (detail per proyek)

### Layout:
- Tabel 3 kolom: [Label | Titik Dua | Nilai]
- Setiap pekerjaan/proyek dipisahkan dengan baris shading abu-abu #D9D9D9

### Fields per pekerjaan:
1. Nama Proyek / Program
2. Nama Instansi/Lembaga
3. Lokasi
4. Posisi/Jabatan
5. Periode (tanggal mulai - selesai)
6. Nilai Kontrak (Rp)
7. Uraian Tugas (textarea — bisa multiline)

---

## SEKSI 5: SERTIFIKASI & KEAHLIAN

### Layout Tabel:
- 3 kolom: [Label | Titik Dua | Nilai]

### Fields:
1. Bidang Keahlian Utama
2. Nama Sertifikat/SKA/SKT
3. Nomor Sertifikat
4. Lembaga Penerbit
5. Tahun Terbit
6. Masa Berlaku

---

## SEKSI 6: PELATIHAN & PENDIDIKAN NON-FORMAL

### Layout Tabel:
- 5 kolom: No | Nama Pelatihan | Penyelenggara | Tahun | Durasi
- Format sama dengan Ringkasan Pengalaman Kerja (ada header row)

---

## SEKSI 7: ORGANISASI PROFESI

### Layout Tabel:
- 4 kolom: No | Nama Organisasi | Jabatan | Tahun
- Ada header row, format sama dengan tabel pengalaman

---

## SEKSI 8: KEMAMPUAN BAHASA

### Layout Tabel:
- 4 kolom: No | Bahasa | Lisan | Tulisan
- Ada header row
- Nilai kemampuan: Pasif / Aktif / Sangat Aktif

---

## SEKSI 9: REFERENSI

### Layout Tabel:
- 3 kolom: [Label | Titik Dua | Nilai]
- Fields: Nama, Jabatan, Instansi, No. Telepon
- Diulang untuk setiap referensi dengan baris pemisah abu-abu

---

## PENUTUP: PERNYATAAN & TANDA TANGAN

### Format:
- Paragraf teks: "Yang bertanda tangan di bawah ini, saya menyatakan bahwa semua
  keterangan yang tercantum dalam daftar riwayat hidup ini adalah benar dan
  dapat dipertanggungjawabkan."
- Spasi setelah paragraf: 24pt
- Baris kota dan tanggal: "[Kota], [Tanggal Bulan Tahun]"
  rata kanan atau posisi kanan halaman
- Teks "Yang Membuat Pernyataan," di bawah kota/tanggal
- Spasi untuk tanda tangan: 4 baris kosong (~2cm)
- Placeholder kotak materai: kotak border tipis ukuran 3x3cm dengan teks
  "Materai Rp 10.000" di tengah — posisi di area tanda tangan
- Nama lengkap (bold, underline)

---

## SPESIFIKASI TEKNIS DOKUMEN

### Jika menggunakan docx.js (Node.js):

```javascript
// Page setup
properties: {
  page: {
    size: { width: 11906, height: 16838 }, // A4 dalam DXA
    margin: { top: 1418, bottom: 1418, left: 1701, right: 1418 }
    // top/bottom = 2.5cm, left = 3cm, right = 2.5cm
    // 1cm = 567 DXA
  }
}

// Font default
styles: {
  default: {
    document: {
      run: { font: "Times New Roman", size: 22 } // 11pt = size 22 dalam half-points
    }
  }
}

// Border tabel standar
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const allBorders = {
  top: thinBorder, bottom: thinBorder,
  left: thinBorder, right: thinBorder
};

// Shading pemisah jenjang pendidikan / antar entri
shading: { fill: "D9D9D9", type: ShadingType.CLEAR }

// Cell padding standar
margins: { top: 80, bottom: 80, left: 120, right: 120 }

// Lebar tabel (A4 dengan margin 3cm kiri, 2.5cm kanan)
// Content width = 11906 - 1701 - 1418 = 8787 DXA
const TABLE_WIDTH = 8787;

// Kolom untuk tabel 3-kolom (label:nilai)
const COL_LABEL = 2551; // ~4.5cm
const COL_COLON = 283;  // ~0.5cm
const COL_VALUE = TABLE_WIDTH - COL_LABEL - COL_COLON; // sisanya
```

### Jika menggunakan Python-docx:

```python
from docx import Document
from docx.shared import Cm, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# Page margins
section = doc.sections[0]
section.page_width  = Cm(21)
section.page_height = Cm(29.7)
section.top_margin    = Cm(2.5)
section.bottom_margin = Cm(2.5)
section.left_margin   = Cm(3.0)
section.right_margin  = Cm(2.5)

# Default font
style = doc.styles['Normal']
style.font.name = 'Times New Roman'
style.font.size = Pt(11)

# Lebar kolom tabel 3-kolom
col_label = Cm(4.5)
col_colon = Cm(0.5)
col_value = Cm(21 - 3.0 - 2.5) - col_label - col_colon

# Helper: tambah border ke sel
def set_cell_border(cell, **kwargs):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('top','left','bottom','right','insideH','insideV'):
        tag = OxmlElement(f'w:{edge}')
        tag.set(qn('w:val'), 'single')
        tag.set(qn('w:sz'), '4')
        tag.set(qn('w:color'), 'CCCCCC')
        tcBorders.append(tag)
    tcPr.append(tcBorders)

# Helper: shading sel
def set_cell_shading(cell, fill="D9D9D9"):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill)
    tcPr.append(shd)
```

---

## FORM INPUT YANG DIBUTUHKAN

Kumpulkan data berikut dari user sebelum generate dokumen:

### Grup 1: Data Pribadi
```json
{
  "namaLengkap": "string",
  "tempatLahir": "string",
  "tanggalLahir": "date (DD/MM/YYYY)",
  "agama": "string",
  "jenisKelamin": "Laki-laki | Perempuan",
  "statusPerkawinan": "Menikah | Belum Menikah | Cerai",
  "alamatKTP": "string",
  "alamatDomisili": "string",
  "nikKTP": "string (16 digit)",
  "noNPWP": "string",
  "kewarganegaraan": "string (default: Indonesia)",
  "noTelepon": "string",
  "email": "string",
  "foto": "file upload (JPG/PNG, min 300x400px)"
}
```

### Grup 2: Pendidikan (array, bisa lebih dari satu)
```json
[{
  "jenjang": "S3 | S2 | S1 | D4 | D3 | SMA | SMK",
  "tanggalLulus": "string",
  "fakultasJurusan": "string",
  "namaPerguruanTinggi": "string",
  "ipk": "string (optional)"
}]
```

### Grup 3: Pengalaman Kerja (array)
```json
[{
  "namaInstansi": "string",
  "namaProyek": "string (optional)",
  "posisi": "string",
  "tingkatWilayah": "Nasional | Provinsi | Kabupaten/Kota",
  "tanggalMulai": "string",
  "tanggalSelesai": "string (atau 'Sekarang')",
  "lamaBekerjaTahun": "number",
  "lamaBekerjaBulan": "number",
  "nilaiKontrak": "number (optional)",
  "uraianTugas": "string (textarea)"
}]
```

### Grup 4: Sertifikasi (array)
```json
[{
  "namaSertifikat": "string",
  "bidang": "string",
  "nomorSertifikat": "string",
  "lembagaPenerbit": "string",
  "tahunTerbit": "string",
  "masaBerlaku": "string"
}]
```

### Grup 5: Pelatihan (array)
```json
[{
  "namaPelatihan": "string",
  "penyelenggara": "string",
  "tahun": "string",
  "durasi": "string"
}]
```

### Grup 6: Organisasi Profesi (array)
```json
[{
  "namaOrganisasi": "string",
  "jabatan": "string",
  "tahunMasuk": "string"
}]
```

### Grup 7: Bahasa (array)
```json
[{
  "bahasa": "string",
  "kemampuanLisan": "Pasif | Aktif | Sangat Aktif",
  "kemampuanTulisan": "Pasif | Aktif | Sangat Aktif"
}]
```

### Grup 8: Referensi (array, max 3)
```json
[{
  "nama": "string",
  "jabatan": "string",
  "instansi": "string",
  "noTelepon": "string"
}]
```

### Grup 9: Pernyataan Penutup
```json
{
  "kotaPenandatangan": "string",
  "tanggalPenandatangan": "date"
}
```

---

## ATURAN KONTEN

1. Semua teks dalam BAHASA INDONESIA
2. Format tanggal: "DD Bulan YYYY" (contoh: "6 Oktober 1974")
3. Format mata uang: "Rp 1.000.000.000" (titik sebagai pemisah ribuan)
4. Kolom "Titik Dua" selalu berisi " : " dengan spasi di kiri dan kanan
5. Nilai kosong ditampilkan sebagai " - " (bukan kosong)
6. Nama bulan menggunakan bahasa Indonesia:
   Januari, Februari, Maret, April, Mei, Juni,
   Juli, Agustus, September, Oktober, November, Desember
7. Urutan pengalaman: terbaru di atas
8. Urutan pendidikan: tertinggi di atas

---

## OUTPUT

- Format file: .DOCX (editable) — wajib
- Nama file: CV_[NamaLengkap]_[Tahun].docx
  Contoh: CV_Ahmad_Dimyati_2024.docx
- Opsional: PDF versi print-ready
- Semua konten harus dapat diedit setelah file di-download

---

## CATATAN PENTING UNTUK AI

- Jangan gunakan border tebal/hitam pada tabel — gunakan border tipis (#CCCCCC)
- Jangan gunakan warna latar tabel yang mencolok — hanya abu-abu muda (#D9D9D9)
  sebagai baris pemisah, sisanya putih
- Judul seksi (DATA PRIBADI, dst.) adalah paragraf di LUAR tabel, bukan header sel
- Foto harus bisa di-upload oleh user dan tertanam dalam dokumen DOCX
- Pastikan tabel tidak terpotong saat print ke PDF
- Gunakan pageBreak di antara seksi utama jika konten terlalu panjang
```
