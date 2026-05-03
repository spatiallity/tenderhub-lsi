# TenderHub LSI - Panduan Pengguna

**Versi**: 2.0  
**Terakhir Diperbarui**: 1 Mei 2026  
**Platform**: Web Application

---

## 📚 Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Memulai](#memulai)
3. [Fitur Utama](#fitur-utama)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Tips & Trik](#tips--trik)
6. [FAQ](#faq)
7. [Troubleshooting](#troubleshooting)

---

## Pengenalan

TenderHub LSI adalah platform intelligence untuk monitoring dan analisis tender yang disesuaikan dengan kebutuhan PT Sucofindo. Platform ini membantu tim sales & marketing untuk:

- 📊 Monitoring tender aktif secara real-time
- 🎯 Identifikasi tender relevan berdasarkan keyword
- 📈 Analisis performa dan winrate
- 👥 Manajemen database tenaga ahli
- 📋 Tracking RUP (Rencana Umum Pengadaan)

---

## Memulai

### Login

1. Buka browser (Chrome, Firefox, Safari, atau Edge)
2. Akses URL: `http://localhost:5174` (development) atau URL production
3. Login dengan kredensial yang diberikan oleh admin

### Navigasi Utama

Platform memiliki 6 menu utama:

1. **Dashboard** - Ringkasan KPI dan aktivitas
2. **Tender Intelligence** - Daftar tender aktif
3. **RUP Pipeline** - Radar paket RUP
4. **Status Tender** - Tracking tender yang diikuti
5. **Tenaga Ahli** - Database tenaga ahli
6. **Pengaturan** - Konfigurasi sistem

---

## Fitur Utama

### 1. Dashboard

**Fungsi**: Melihat ringkasan performa dan aktivitas terbaru

**Fitur**:
- ✅ KPI Cards (Total Tender, Tender Baru, Urgent, Winrate)
- ✅ Chart Distribusi Portfolio
- ✅ Chart Distribusi Nilai Kontrak
- ✅ Recent Activity (tender baru, deadline mendesak)
- ✅ Winrate Analysis

**Cara Menggunakan**:
1. Klik pada KPI card untuk filter data
2. Klik pada chart untuk melihat detail
3. Klik pada item di Recent Activity untuk buka detail

---

### 2. Tender Intelligence

**Fungsi**: Monitoring dan analisis tender aktif

**Fitur**:
- ✅ Search tender (nama, instansi, lokasi)
- ✅ Filter multi-kriteria (portfolio, nilai, lokasi, deadline)
- ✅ Sorting (nama, nilai, deadline, relevansi)
- ✅ Relevance score berdasarkan keyword matching
- ✅ Countdown deadline dengan color coding
- ✅ Detail tender dengan timeline

**Cara Menggunakan**:

#### Mencari Tender
1. Ketik keyword di search box (auto-search setelah 300ms)
2. Gunakan filter panel di kanan untuk refine hasil
3. Klik pada tender untuk melihat detail

#### Filter Tender
- **Portfolio**: FLP, SDA, FITI
- **Nilai Kontrak**: Slider untuk range nilai
- **Lokasi**: Pilih provinsi
- **Deadline**: Filter berdasarkan urgency
- **Status**: Aktif, Selesai, Dibatalkan

#### Melihat Detail Tender
1. Klik pada row tender di tabel
2. Side panel akan muncul dari kanan
3. Lihat informasi lengkap:
   - Nama tender dan instansi
   - Nilai HPS (Harga Perkiraan Sendiri)
   - Timeline tahapan
   - Progress bar
   - Matched keywords
   - Catatan internal
4. Klik "Lihat di LPSE" untuk buka di website resmi

#### Menambah Catatan
1. Buka detail tender
2. Scroll ke bagian "Catatan Internal"
3. Ketik catatan Anda
4. Catatan akan auto-save setelah 2 detik (lihat indikator hijau)

---

### 3. RUP Pipeline

**Fungsi**: Radar awal paket RUP sebelum naik menjadi tender

**Fitur**:
- ✅ Search paket RUP
- ✅ Filter berdasarkan instansi, nilai, lokasi
- ✅ Urgency indicator (merah ≤7 hari, amber ≤30 hari, hijau >30 hari)
- ✅ Readiness score (kesiapan mengikuti tender)
- ✅ Timeline pengadaan

**Cara Menggunakan**:

#### Mencari Paket RUP
1. Ketik keyword di search box
2. Gunakan filter untuk refine hasil
3. Perhatikan urgency indicator untuk prioritas

#### Melihat Detail RUP
1. Klik pada paket RUP
2. Lihat readiness score breakdown:
   - Ketersediaan tenaga ahli (30 poin)
   - Pengalaman serupa (25 poin)
   - Kapasitas tim (20 poin)
   - Lokasi strategis (15 poin)
   - Kesiapan dokumen (10 poin)
3. Total score menentukan level kesiapan:
   - **Sangat Siap**: 80-100 poin (hijau)
   - **Siap**: 60-79 poin (biru)
   - **Cukup Siap**: 40-59 poin (amber)
   - **Perlu Persiapan**: <40 poin (merah)

---

### 4. Status Tender

**Fungsi**: Tracking tender yang sudah/akan diikuti

**Fitur**:
- ✅ Grouping berdasarkan status internal
- ✅ Progress bar untuk setiap tender
- ✅ Deadline countdown
- ✅ PIC (Person In Charge)
- ✅ Nilai HPS
- ✅ Section khusus untuk Menang/Kalah

**Cara Menggunakan**:

#### Melihat Status Tender
1. Tender dikelompokkan berdasarkan status:
   - **Akan Diikuti**: Tender yang direncanakan
   - **Sedang Diikuti**: Tender dalam proses
   - **Menang**: Tender yang dimenangkan
   - **Kalah**: Tender yang tidak dimenangkan
2. Klik pada tender untuk lihat detail
3. Progress bar menunjukkan tahapan saat ini

#### Update Status Tender
1. Buka detail tender
2. Pilih status baru dari dropdown
3. Status akan auto-save

---

### 5. Tenaga Ahli

**Fungsi**: Manajemen database tenaga ahli

**Fitur**:
- ✅ Search tenaga ahli (nama, keahlian)
- ✅ Filter berdasarkan portfolio, level, rating
- ✅ Availability calendar
- ✅ Riwayat pekerjaan
- ✅ Rating dan review

**Cara Menggunakan**:

#### Mencari Tenaga Ahli
1. Ketik nama atau keahlian di search box
2. Gunakan filter untuk refine hasil
3. Klik pada tenaga ahli untuk lihat detail

#### Melihat Availability
1. Buka detail tenaga ahli
2. Lihat calendar availability:
   - **Hijau**: Tersedia
   - **Amber**: Tentative
   - **Merah**: Bertugas
3. Gunakan arrow untuk navigasi bulan

#### Menambah Tenaga Ahli Baru
1. Klik tombol "Tambah Tenaga Ahli"
2. Isi form:
   - Nama lengkap
   - Keahlian
   - Portfolio
   - Level (Junior, Senior, Expert)
   - Kontak
3. Klik "Simpan"

---

### 6. Pengaturan

**Fungsi**: Konfigurasi sistem

**Fitur**:
- ✅ Manajemen keyword
- ✅ Threshold settings
- ✅ Coverage wilayah
- ✅ User management

**Cara Menggunakan**:

#### Mengelola Keyword
1. Buka tab "Keywords"
2. Lihat daftar keyword aktif
3. Tambah keyword baru:
   - Ketik keyword
   - Pilih portfolio
   - Set bobot (1-10)
4. Edit atau hapus keyword existing

#### Mengatur Threshold
1. Buka tab "Thresholds"
2. Atur nilai threshold:
   - Minimum relevance score
   - Urgent deadline (hari)
   - High value tender (Rp)
3. Klik "Simpan"

---

## Keyboard Shortcuts

Platform mendukung keyboard shortcuts untuk efisiensi:

### Global Shortcuts

| Shortcut | Fungsi |
|----------|--------|
| `Ctrl+K` atau `Cmd+K` | Buka pencarian global |
| `ESC` | Tutup modal/panel |
| `Tab` | Navigasi ke elemen berikutnya |
| `Shift+Tab` | Navigasi ke elemen sebelumnya |

### Pencarian Global

| Shortcut | Fungsi |
|----------|--------|
| `↑` | Navigasi ke hasil sebelumnya |
| `↓` | Navigasi ke hasil berikutnya |
| `Enter` | Pilih hasil |
| `ESC` | Tutup pencarian |

### Development Only

| Shortcut | Fungsi |
|----------|--------|
| `Ctrl+Shift+P` | Toggle performance monitor |

---

## Tips & Trik

### 1. Pencarian Cepat

Gunakan `Ctrl+K` untuk pencarian global yang mencari di semua data (tender, RUP, tenaga ahli) sekaligus.

### 2. Filter Kombinasi

Kombinasikan multiple filters untuk hasil yang lebih spesifik:
- Portfolio + Nilai + Lokasi
- Deadline + Status + Relevansi

### 3. Sorting Multi-Level

Klik header kolom untuk sorting. Klik lagi untuk reverse order.

### 4. Keyboard Navigation

Gunakan `Tab` untuk navigasi tanpa mouse. Semua fitur accessible via keyboard.

### 5. Auto-Save

Catatan dan perubahan status akan auto-save. Perhatikan indikator hijau untuk konfirmasi.

### 6. Refresh Data

Data akan auto-refresh setiap 5 menit. Untuk manual refresh, reload page (F5).

### 7. Export Data

Gunakan tombol "Export" untuk download data dalam format Excel atau PDF.

---

## FAQ

### Q: Bagaimana cara menambah tender baru?

**A**: Tender otomatis di-scrape dari LPSE. Tidak perlu input manual. Jika ada tender yang terlewat, hubungi admin.

### Q: Kenapa relevance score saya rendah?

**A**: Relevance score dihitung berdasarkan keyword matching. Pastikan keyword di Pengaturan sudah lengkap dan sesuai.

### Q: Bagaimana cara mengubah password?

**A**: Klik avatar di kanan atas → Profil Saya → Ubah Password.

### Q: Apakah data bisa di-export?

**A**: Ya, gunakan tombol "Export" di setiap halaman untuk download data.

### Q: Bagaimana cara melihat tender yang sudah selesai?

**A**: Di Tender Intelligence, gunakan filter Status → Selesai.

### Q: Apakah bisa akses dari mobile?

**A**: Ya, platform fully responsive dan bisa diakses dari smartphone atau tablet.

### Q: Bagaimana cara menghubungi support?

**A**: Hubungi IT Support atau email ke support@sucofindo.co.id

---

## Troubleshooting

### Masalah: Page tidak loading

**Solusi**:
1. Refresh page (F5)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Coba browser lain
4. Hubungi IT Support

### Masalah: Data tidak muncul

**Solusi**:
1. Check koneksi internet
2. Refresh page
3. Check filter settings (mungkin terlalu restrictive)
4. Hubungi admin jika masalah persists

### Masalah: Search tidak bekerja

**Solusi**:
1. Tunggu 300ms setelah ketik (debounce)
2. Clear search box dan coba lagi
3. Refresh page
4. Hubungi IT Support

### Masalah: Modal tidak bisa ditutup

**Solusi**:
1. Tekan ESC
2. Klik di luar modal (backdrop)
3. Klik tombol X di kanan atas
4. Refresh page jika masih stuck

### Masalah: Performance lambat

**Solusi**:
1. Close tab lain yang tidak digunakan
2. Clear browser cache
3. Restart browser
4. Check koneksi internet
5. Hubungi IT Support jika masalah persists

---

## Kontak Support

**IT Support**:
- Email: support@sucofindo.co.id
- Phone: (021) 1234-5678
- WhatsApp: 0812-3456-7890

**Jam Operasional**:
- Senin - Jumat: 08:00 - 17:00 WIB
- Sabtu: 08:00 - 12:00 WIB
- Minggu & Libur: Closed

---

**Versi**: 2.0  
**Terakhir Diperbarui**: 1 Mei 2026  
**© 2026 PT Sucofindo (Persero)**
