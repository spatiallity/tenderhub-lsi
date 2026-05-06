# Cara Mengisi Data Project untuk CV

## 📋 Field yang Dibutuhkan Template CV

Untuk setiap project, template CV Sucofindo membutuhkan data berikut:

### Data Project CV (8 field):
1. **Nama Proyek** - Sudah ada ✅
2. **Lokasi Proyek** - Perlu diisi ⚠️
3. **Pengguna Jasa** - Perlu diisi ⚠️
4. **Nama Perusahaan** - Perlu diisi ⚠️
5. **Uraian Tugas** - Perlu diisi ⚠️
6. **Waktu Pelaksanaan** (Mulai - Selesai) - Perlu diisi ⚠️
7. **Posisi Penugasan** - Perlu diisi ⚠️
8. **Status Kepegawaian** - Perlu diisi ⚠️
9. **Surat Referensi** - Perlu diisi ⚠️

## 🔧 Cara Mengisi Data

### Opsi 1: Via Database (Supabase) - RECOMMENDED

Jalankan SQL query di Supabase untuk update data project:

```sql
-- Update project dengan ID tertentu
UPDATE expert_projects
SET
  lokasi_proyek = 'Kel. Sepaku, Kec. Sapaku, Kab. Penajam Paser Utara - Provinsi Kalimantan Timur',
  pengguna_jasa = 'Direktorat Perencanaan Mikro, Otorita Ibukota Nusantara',
  uraian_tugas = 'Membantu menyusun metodologi, rencana kerja, dan jadwal tim pelaksana pekerjaan; Membantu menyusun analisis dan menyajikan hasil analisis setiap tenaga ahli dan tenaga penunjang menyangkut tugas, hasil yang akan dicapai (output), jadwal penugasan dan jadwal output pekerjaan.',
  waktu_mulai = 'Agustus 2025',
  waktu_selesai = 'Desember 2025',
  posisi_penugasan = 'Ahli Perencanaan Wilayah dan Kota',
  status_kepegawaian = 'Tidak Tetap',
  surat_referensi = '-'
WHERE id = 1;  -- Ganti dengan ID project yang sesuai
```

### Opsi 2: Via API (Postman/curl)

```bash
# Update project data
curl -X PATCH "http://localhost:8000/api/v1/experts/projects/1" \
  -H "Content-Type: application/json" \
  -d '{
    "lokasi_proyek": "Jakarta Pusat, DKI Jakarta",
    "pengguna_jasa": "Kementerian PUPR",
    "uraian_tugas": "Melakukan supervisi konstruksi...",
    "waktu_mulai": "Januari 2024",
    "waktu_selesai": "Desember 2024",
    "posisi_penugasan": "Team Leader",
    "status_kepegawaian": "Tetap",
    "surat_referensi": "123/SK/PUPR/2024"
  }'
```

### Opsi 3: Bulk Update (Multiple Projects)

```sql
-- Update semua project dari expert tertentu
UPDATE expert_projects
SET
  status_kepegawaian = 'Tidak Tetap',
  surat_referensi = '-'
WHERE expert_id = 560;  -- Ganti dengan ID expert

-- Update berdasarkan tahun
UPDATE expert_projects
SET
  waktu_mulai = 'Januari 2024',
  waktu_selesai = 'Desember 2024'
WHERE tahun = 2024;
```

## 📝 Contoh Data Lengkap

### Project 1 (2025):
```sql
UPDATE expert_projects SET
  nama_proyek = 'Penyusunan Rencana Pengembangan Kawasan (RPK) Sub Sub Wilayah Perencanaan (SSWP) 2C-1 WP IKN Barat',
  lokasi_proyek = 'Kel. Sepaku, Kec. Sapaku, Kab. Penajam Paser Utara - Provinsi Kalimantan Timur',
  pengguna_jasa = 'Direktorat Perencanaan Mikro, Otorita Ibukota Nusantara',
  nama_perusahaan_lain = 'PT. Ciriajasa Engineering Consultant, Jakarta',
  uraian_tugas = 'Membantu menyusun metodologi, rencana kerja, dan jadwal tim pelaksana pekerjaan; Membantu menyusun analisis dan menyajikan hasil analisis setiap tenaga ahli dan tenaga penunjang menyangkut tugas, hasil yang akan dicapai (output), jadwal penugasan dan jadwal output pekerjaan; Membuat Rencana Kerja untuk penugasan seluruh anggota Team; Melakukan kunjungan lapangan, koordinasi terkait laporan progress kegiatan; Mengkoordinir TA untuk membuat laporan presentasi hasil kegiatan lapangan dengan semua pihak yang berkepentingan; Menyusun laporan dan menginventarisasi permasalahan dan tindak lanjut berdasarkan hasil identifikasi dan lapangan (primer dan sekunder); Menyampaikan hasil laporan DED KEK Sorong kepada PPK setelah mendapatkan persetujuan melalui BA hasil',
  waktu_mulai = 'Agustus 2025',
  waktu_selesai = 'Desember 2025',
  posisi_penugasan = 'Ahli Perencanaan Wilayah dan Kota',
  status_kepegawaian = 'Tidak Tetap',
  surat_referensi = '-',
  tahun = 2025
WHERE id = 1;
```

### Project 2 (2024):
```sql
UPDATE expert_projects SET
  nama_proyek = 'Development of Capital Investment Planning (CIP) Framework and Implementation-National Urban Development Project (NUDP)',
  lokasi_proyek = 'Kota Denpasar-Provinsi Bali',
  pengguna_jasa = 'Direktorat SUPD II, Direktorat Jenderal Bina Bangda, Kementerian Dalam Negeri',
  nama_perusahaan_lain = 'PT. Lenggogeni Consultant, Jakarta',
  uraian_tugas = 'Bekerja sama dengan Pemimpin Tim Leader Proyek dan Ahli Senior Perencanaan Infrastruktur Terpadu, dalam menyusun Rencana Induk Infrastruktur Terpadu Kota Denpasar',
  waktu_mulai = 'Desember 2022',
  waktu_selesai = 'Mei 2025',
  posisi_penugasan = 'Ahli Perencanaan Infrastruktur Terpadu Tingkat Kota',
  status_kepegawaian = 'Tidak Tetap',
  surat_referensi = '-',
  tahun = 2024
WHERE id = 2;
```

## 🎯 Format Data

### Lokasi Proyek:
- Format: `Kelurahan/Kota, Kecamatan, Kabupaten - Provinsi`
- Contoh: `Kel. Sepaku, Kec. Sapaku, Kab. Penajam Paser Utara - Provinsi Kalimantan Timur`

### Pengguna Jasa:
- Format: `Nama Direktorat/Instansi, Nama Kementerian/Lembaga`
- Contoh: `Direktorat Perencanaan Mikro, Otorita Ibukota Nusantara`

### Uraian Tugas:
- Format: Bullet points dengan semicolon (;)
- Contoh: `Membantu menyusun metodologi; Membuat rencana kerja; Melakukan koordinasi`

### Waktu:
- Format: `Bulan Tahun`
- Contoh: `Agustus 2025`, `Desember 2025`

### Status Kepegawaian:
- Pilihan: `Tetap` atau `Tidak Tetap`

### Surat Referensi:
- Format: `Nomor/Kode/Tahun` atau `-` jika tidak ada
- Contoh: `10/SK/RENTEK/04/2023` atau `-`

## 🔄 Workflow

1. **Isi Data Pribadi** via "Edit Data CV":
   - Tempat/Tanggal Lahir
   - Posisi yang Diusulkan
   - Pendidikan Formal
   - Pendidikan Non Formal
   - Penguasaan Bahasa

2. **Isi Data Project** via SQL/API:
   - Lokasi Proyek
   - Pengguna Jasa
   - Uraian Tugas
   - Waktu Mulai & Selesai
   - Posisi Penugasan
   - Status Kepegawaian
   - Surat Referensi

3. **Generate CV**:
   - Klik "Generate CV"
   - CV akan menampilkan project dikelompokkan per tahun
   - Data kosong akan ditampilkan sebagai cell kosong (bukan "Belum diisi")

## ⚠️ Catatan Penting

1. **Tahun Project**: CV akan mengelompokkan project berdasarkan field `tahun` atau `waktu_mulai`
2. **Urutan**: Project akan diurutkan dari tahun terbaru ke terlama
3. **Jumlah Table**: Template memiliki 3 table project, jadi maksimal 3 tahun yang akan ditampilkan
4. **Data Kosong**: Jika field kosong, cell akan kosong (tidak ada text "Belum diisi")

## 🚀 Quick Start

Untuk testing cepat, jalankan SQL ini:

```sql
-- Set default values untuk semua project
UPDATE expert_projects
SET
  status_kepegawaian = COALESCE(status_kepegawaian, 'Tidak Tetap'),
  surat_referensi = COALESCE(surat_referensi, '-'),
  nama_perusahaan_lain = COALESCE(nama_perusahaan_lain, 'PT SUCOFINDO (PERSERO)')
WHERE expert_id = 560;  -- Ganti dengan ID expert Anda
```

Kemudian isi data spesifik per project sesuai kebutuhan!
