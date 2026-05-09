# TenderHub LSI — Implementation Tasks

> **Cara pakai:** Baca file ini dulu sebelum mulai coding. Kerjakan per section dan konfirmasi sebelum lanjut ke section berikutnya.

---

## Konteks Proyek

Web app manajemen tender bernama **TenderHub** untuk LSI (PT SUCOFINDO). Ada dua tipe user utama: **SBU Pusat** (kantor pusat) dan **Cabang** (kantor cabang), plus role **Admin**.

Yang sudah ada di codebase:
- Field `Status Internal` pada tender dengan nilai: `Dipantau`, `Akan Diikuti`, `Sudah Diikuti`, `Menang`, `Kalah`, `Tidak Relevan`
- Menu **Status Tender** yang berisi Kanban Board — jangan direbuild dari nol
- Tombol konfirmasi Save yang muncul ketika user mengubah Status Internal di tabel — jangan diubah behavior ini

Sebelum mulai coding apapun: **baca dan pahami dulu** project structure, tech stack, database schema, dan authentication system yang sudah ada.

---

## Section 1 — Exclusive Branch Claiming pada Tender & RUP

- Satu Tender atau RUP hanya bisa di-claim oleh **satu cabang atau SBU Pusat** saja.
- Begitu sebuah cabang set Status Internal pada tender, tender itu menjadi milik cabang tersebut — cabang lain tidak bisa set Status Internal pada tender yang sama.
- Satu cabang **bisa** claim banyak tender (one branch = many tenders, tapi one tender = one branch only).
- Di halaman list Tender dan RUP, tampilkan badge/label yang menunjukkan **cabang mana** yang sudah claim tender tersebut. Badge ini visible untuk semua user yang login, tapi read-only untuk non-pemilik.
- Tender yang belum di-claim siapapun ditampilkan sebagai **available/unclaimed**.
- Cabang pemilik tender bisa update Status Internal-nya secara bebas (Dipantau → Akan Diikuti → Sudah Diikuti, dst.).
- Admin bisa **reassign atau release** claim tender jika diperlukan.

**Enforcement rules:**
- Wajib di-enforce di level UI (disable/sembunyikan kontrol Status Internal untuk non-pemilik)
- Wajib di-enforce di level backend/API (tolak unauthorized update)

---

## Section 2 — Status Tender Menu / Kanban Board (Modify, Don't Rebuild)

Kanban Board di menu Status Tender saat ini menampilkan semua tender. Ubah behavior-nya menjadi:

- User **Cabang** hanya melihat tender yang mereka claim di Kanban Board mereka.
- User **SBU Pusat** hanya melihat tender yang di-claim oleh SBU Pusat.
- Kolom Kanban tetap sama, mapping ke nilai Status Internal yang sudah ada:

  | Kolom | Status Internal |
  |---|---|
  | Dipantau | Dipantau |
  | Akan Diikuti | Akan Diikuti |
  | Sudah Diikuti | Sudah Diikuti |
  | Menang | Menang |
  | Kalah | Kalah |
  | Tidak Relevan | Tidak Relevan |

- Memindahkan card antar kolom akan mengupdate nilai Status Internal tender tersebut.
- Satu cabang tidak bisa melihat atau berinteraksi dengan card milik cabang lain.

---

## Section 3 — Admin Global Overview Dashboard

Admin yang membuka menu Status Tender melihat **global view**, bukan Kanban single-branch:

- Tampilkan summary semua cabang + SBU Pusat: berapa tender yang di-claim, dan berapa per tahap Status Internal.
- Admin bisa select/filter berdasarkan cabang tertentu untuk melihat Kanban Board cabang itu (read-only — Admin tidak bisa move cards).
- Admin bisa reassign atau release claim tender dari view ini.

---

## Section 4 — Logo di Login Page & Sidebar

- Tambahkan logo TenderHub di:
  - **Halaman Login**: posisi center, di atas form login
  - **Sidebar**: di pojok kiri atas, menggantikan atau berdampingan dengan teks nama app yang sekarang
- File logo ada di `public/images/tenderhub-logo.png`. Kalau path belum ada, buat foldernya.
- Pastikan logo responsive dan tidak merusak layout di layar kecil.

---

## Section 5 — UI Improvements

Baca setiap komponen yang sudah ada sebelum mengedit. **Improve, jangan rebuild.**

### Sidebar
- Buat section label (`TENDER OPS`, `SUPPORT LAYANAN PUSAT`, `ADMIN`) sedikit lebih bold atau naikkan kontrasnya supaya tidak tenggelam secara visual.
- Kecilkan font size teks deskripsi perusahaan dan copyright di bagian bawah sidebar, atau jadikan tooltip/popover untuk mengurangi clutter.

### Dashboard
- Kecilkan ukuran icon di dalam stat cards (Total Tender Aktif, Tender Sesuai Keyword, dll.) supaya angka jadi elemen yang dominan, bukan icon-nya.
- Tambahkan micro-legend kecil di bawah header "Recent Activity" yang menjelaskan arti warna dot (contoh: merah = deadline mendekat, biru = tender baru, hijau = sudah diikuti). Cek logic yang sudah ada untuk memastikan legend sesuai dengan assignment warna dot yang aktual.

### Tabel RUP Pipeline & Tender Intelligence
- Ubah style tombol "Detail" dari solid filled menjadi **ghost/outline button** di semua tabel. Ini mengurangi visual noise saat ada banyak row. Pastikan hover state tetap jelas.
- Di RUP Pipeline, pastikan badge PORTOFOLIO (SDA, FLP, FITI) punya padding yang cukup dan tidak terasa cramped di sebelah tombol Detail.

### Detail Panel (slide-in)
- Naikkan kontras/opacity teks label di dalam detail panel (contoh: "Kode RUP", "Datamart ID", "Jenis Pengadaan") — saat ini terlalu light dan susah dibaca di beberapa layar. Target minimal kontras 4.5:1 terhadap background.
- Tambahkan subtle visual separator (divider atau background yang sedikit berbeda) di atas section STATUS INTERNAL dan CATATAN INTERNAL di bagian bawah detail panel, supaya terasa sebagai action zone yang distinct.

### Kanban Board (Status Tender)
- Tambahkan **colored left border** pada setiap Kanban card sesuai kolomnya:

  | Kolom | Warna Border |
  |---|---|
  | Dipantau | Gray |
  | Akan Diikuti | Yellow / Amber |
  | Sudah Diikuti | Blue |
  | Menang | Green |
  | Kalah | Red |
  | Tidak Relevan | Light gray / muted |

- Ganti teks empty state "Tidak ada tender" yang plain di setiap kolom dengan small icon + pesan yang lebih friendly, contoh: icon empty inbox + teks "Belum ada tender di sini."

### Halaman Tenaga Ahli
- **Sembunyikan kolom Rating** (bintang + jumlah review) dari tabel jika semua entri memiliki 0 review. Kalau ada minimal satu entri yang punya review, tampilkan kolomnya. Ini mencegah kolom terlihat seperti fitur yang belum selesai.

### Audit Log
- Tambahkan color coding pada action badge selain DELETE:
  - `INSERT` / `CREATE`: **green**
  - `UPDATE` / `EDIT`: **orange** atau yellow
  - `DELETE`: **red** (sudah ada, pertahankan)

---

## Section 6 — Seed / Dummy Data

Cek struktur seeder/seed file yang sudah ada terlebih dahulu. **Tambahkan ke dalamnya — jangan replace atau hapus seed data yang sudah ada.**

### Unit Kerja (Cabang + Pusat)

Buat entri unit kerja berikut beserta divisi regional-nya:

| Unit Kerja | Divisi Regional |
|---|---|
| Bandar Lampung | Barat |
| Bandung | Barat |
| Batam | Barat |
| Bekasi | Barat |
| Bengkulu | Barat |
| Cilacap | Barat |
| Cilegon | Barat |
| Cirebon | Barat |
| Dumai | Barat |
| Jakarta | Barat |
| Jambi | Barat |
| Medan | Barat |
| Padang | Barat |
| Palembang | Barat |
| Pekanbaru | Barat |
| Semarang | Barat |
| Balikpapan | Timur |
| Banjarmasin | Timur |
| Batulicin | Timur |
| Bontang | Timur |
| Denpasar | Timur |
| Kendari | Timur |
| Makassar | Timur |
| Pontianak | Timur |
| Samarinda | Timur |
| Sangatta | Timur |
| Surabaya | Timur |
| Tarakan | Timur |
| Timika | Timur |
| SBU LSI | Pusat |

### User Accounts (Dummy)

Untuk setiap unit kerja di atas, buat satu user account:
- **Name**: `Admin [Unit Kerja]` — contoh: "Admin Bandung", "Admin Makassar", "Admin SBU LSI"
- **Email**: lowercase, tanpa spasi, format `[unitkerja]@lsi.co.id` — contoh: `bandung@lsi.co.id`, `balikpapan@lsi.co.id`, `sbulsi@lsi.co.id`
- **Password**: `password123` (di-hash dengan method yang sudah dipakai app)
- **Role**: `cabang` untuk semua kantor cabang, `pusat` untuk SBU LSI
- Assign setiap user ke unit kerja masing-masing

Tambahkan juga satu akun admin:
- **Name**: Super Admin
- **Email**: `admin@lsi.co.id`
- **Password**: `password123`
- **Role**: `admin`

### Dummy Tenders

Baca Tender model/schema yang sudah ada terlebih dahulu untuk memahami semua required fields dan tipe datanya. Kemudian **top up data tender yang sudah ada hingga totalnya sekitar 100 entri**.

Variasikan field berikut agar realistis untuk konteks perusahaan infrastruktur/engineering Indonesia:
- **Nama paket**: contoh "Pengadaan Jasa Konsultansi Pengawasan Pembangunan Gedung", "Pekerjaan Konstruksi Jaringan Pipa Air Bersih", "Pengadaan Alat Laboratorium Geoteknik", dll.
- **Instansi/owner**: variasikan antara PLN, Pertamina, PUPR, Kementerian ESDM, Pemerintah Kota/Kabupaten, anak perusahaan BUMN, dll.
- **Nilai pagu**: randomize antara Rp 500 juta hingga Rp 50 miliar
- **Lokasi**: sebar ke berbagai provinsi dan kota di Indonesia
- **Tanggal mulai & selesai/deadline**: sebar di range 2024–2025
- **Status tender** (public-facing, bukan Status Internal): variasikan sesuai nilai yang sudah ada di schema
- **Status Internal**: biarkan null/kosong untuk semua dummy tender baru (unclaimed)
- **claimed_by / unit_kerja_id**: biarkan null untuk semua dummy tender baru

Gunakan loop atau factory pattern — jangan hardcode 100 entri satu per satu.

### Dummy RUP (Rencana Umum Pengadaan)

Pendekatan sama seperti tender di atas. Baca RUP model/schema terlebih dahulu, lalu **top up data RUP yang sudah ada hingga totalnya sekitar 100 entri**.

Variasikan field berikut:
- **Nama paket**: contoh "Pengadaan Jasa Konsultansi Perencanaan", "Pengadaan Peralatan dan Mesin", "Jasa Konsultansi Manajemen Konstruksi", dll.
- **K/L/PD**: variasikan antara berbagai instansi pemerintah Indonesia
- **Pagu anggaran**: randomize antara Rp 200 juta hingga Rp 30 miliar
- **Tahun anggaran**: gunakan 2024 dan 2025
- **Metode pengadaan**: variasikan antara Tender, Seleksi, Pengadaan Langsung, Penunjukan Langsung
- **Lokasi pekerjaan**: sebar ke seluruh Indonesia
- **Status Internal**: biarkan null/kosong (unclaimed) untuk semua dummy RUP baru

Gunakan loop atau factory pattern.

### Dummy Tender & RUP Claims

Setelah semua data di atas ter-seed, **assign sekitar 40–50% tender dan RUP** ke cabang secara random untuk mensimulasikan penggunaan nyata:
- Pilih unit kerja secara random dari daftar yang sudah di-seed
- Assign nilai Status Internal secara random dari: Dipantau, Akan Diikuti, Sudah Diikuti, Menang, Kalah, Tidak Relevan
- Pastikan tidak ada satu tender atau RUP yang di-assign ke lebih dari satu unit kerja
- Distribusikan claim secara merata antar cabang — hindari semua claim menumpuk di satu atau dua cabang saja

---

## Implementation Notes

- Baca implementasi Kanban Board di "Status Tender" dengan teliti sebelum membuat perubahan — extend dan scope, jangan rebuild.
- Rule "one tender = one branch" wajib di-enforce di level UI dan backend/API.
- Behavior tombol Save konfirmasi saat mengubah Status Internal di tabel harus dipertahankan apa adanya.
- Cek model user/role/branch yang sudah ada sebelum membuat apapun yang baru. Reuse struktur yang sudah ada sebisa mungkin.
- Ikuti code style, naming convention, dan folder structure yang sudah ada.
- Setelah selesai, berikan ringkasan semua file yang diubah dan migration/seed yang perlu dijalankan.
