# Requirements Document

## Introduction

Fitur ini mencakup review menyeluruh dan perbaikan UI/UX pada aplikasi web LSI Tender Intelligence (TenderHub). Berdasarkan analisis kode sumber, ditemukan sejumlah masalah: ketidaksinkronan data tahapan tender antara Dashboard dan halaman Tender Intelligence, duplikasi komponen yang tidak terpakai, inkonsistensi styling antara komponen lama dan baru, masalah navigasi mobile, serta beberapa area UX yang dapat dioptimalkan. Perbaikan ini bertujuan meningkatkan konsistensi data, kejelasan informasi, dan kemudahan penggunaan di seluruh halaman aplikasi.

---

## Glossary

- **TenderHub**: Nama aplikasi web LSI Tender Intelligence.
- **Dashboard**: Halaman ringkasan utama yang menampilkan KPI, Recent Activity, Winrate, dan distribusi instansi.
- **Recent Activity**: Widget di Dashboard yang menampilkan aktivitas monitoring terbaru berupa daftar event tender.
- **Tender Intelligence**: Halaman daftar tender aktif dengan filter, tabel, dan detail panel.
- **RUP Pipeline**: Halaman daftar Rencana Umum Pengadaan sebagai radar awal sebelum tender.
- **Status Tender**: Halaman yang menampilkan tender berstatus "Akan Diikuti" dan "Sudah Diikuti".
- **SidePanel**: Komponen panel geser dari kanan layar untuk menampilkan detail tender, RUP, atau tenaga ahli.
- **AppShell**: Komponen layout utama yang membungkus sidebar, konten halaman, dan semua SidePanel global.
- **PRAKUAL_STAGES**: Daftar 21 tahapan tender dengan metode Prakualifikasi.
- **PASCAKUAL_STAGES**: Daftar 12 tahapan tender dengan metode Pascakualifikasi.
- **RECENT_ACTIVITY**: Konstanta statis di `constants.js` yang berisi data dummy aktivitas terbaru.
- **enrichTender**: Fungsi di `helpers.js` yang memperkaya data tender mentah dengan informasi tahapan, deadline, dan relevansi.
- **currentStageName**: Nama tahap tender saat ini, dihitung dari `PRAKUAL_STAGES` atau `PASCAKUAL_STAGES` berdasarkan metode tender.
- **internalStatus**: Status internal tender yang dikelola pengguna: Dipantau, Akan Diikuti, Sudah Diikuti, Menang, Kalah, Tidak Relevan.
- **Badge**: Komponen label berwarna untuk menampilkan status, portofolio, atau kategori.
- **CountdownBadge**: Komponen badge yang menampilkan sisa hari menuju deadline tahap tender.
- **KpiCard**: Komponen kartu ringkasan angka di Dashboard.
- **Sidebar**: Komponen navigasi kiri yang dapat di-collapse.
- **Toast**: Notifikasi singkat yang muncul di pojok kanan bawah layar.
- **PIC**: Person In Charge, pengguna yang di-assign sebagai penanggung jawab tender.
- **HPS**: Harga Perkiraan Sendiri, nilai estimasi kontrak tender.
- **Portofolio / Subportofolio**: Kategori bisnis LSI: FLP (Foto, Lidar, Pemetaan), SDA (Sumber Daya Alam), FITI (Feasibility, Investasi, Teknologi Informasi).
- **Instansi**: Organisasi pemerintah yang mengadakan tender, seperti Kementerian, Pemerintah Provinsi, Pemerintah Kabupaten/Kota, atau Lembaga.
- **Dummy_Data_Service**: Modul backend di `backend/app/services/dummy_data.py` yang menyediakan data dummy untuk tender, RUP, dan tenaga ahli untuk keperluan demo dan testing.

---

## Requirements

### Requirement 1: Sinkronisasi Data Tahapan Tender di Recent Activity

**User Story:** Sebagai pengguna Dashboard, saya ingin melihat nama tahapan tender di Recent Activity yang konsisten dengan nama tahapan di halaman Tender Intelligence, sehingga saya tidak bingung dengan perbedaan terminologi.

#### Acceptance Criteria

1. WHEN halaman Dashboard dimuat, THE Dashboard SHALL menampilkan Recent Activity yang menggunakan nama tahapan tender yang identik dengan nilai `currentStageName` dari data tender yang sudah di-enrich oleh fungsi `enrichTender`.
2. WHEN data tender berhasil dimuat dari API atau fallback, THE Dashboard SHALL mengganti konten `RECENT_ACTIVITY` statis dengan data aktivitas yang dihasilkan secara dinamis dari daftar tender aktif.
3. WHEN tender memiliki `daysLeft` kurang dari atau sama dengan 7, THE Dashboard SHALL menampilkan event tersebut di Recent Activity dengan label "Deadline mendekat" diikuti nama tender.
4. WHEN tender baru terdeteksi (ada di `newTenderIds`), THE Dashboard SHALL menampilkan event tersebut di Recent Activity dengan label "Tender baru" diikuti nama tender.
5. WHEN tender memiliki perubahan `currentStageName` dibandingkan sesi sebelumnya, THE Dashboard SHALL menampilkan event tersebut di Recent Activity dengan label "Status berubah" diikuti nama tender dan nama tahap baru.
6. IF tidak ada data tender yang tersedia, THEN THE Dashboard SHALL menampilkan pesan "Belum ada aktivitas terbaru" di area Recent Activity.
7. THE Recent_Activity_Widget SHALL menampilkan maksimal 6 item aktivitas terbaru, diurutkan berdasarkan urgensi (deadline terdekat lebih dulu, lalu tender baru).

---

### Requirement 2: Konsistensi Komponen dan Penghapusan Duplikasi

**User Story:** Sebagai developer yang memelihara aplikasi, saya ingin semua halaman menggunakan komponen UI yang sama dari `components/UI/index.jsx`, sehingga tampilan konsisten dan tidak ada kode duplikat yang membingungkan.

#### Acceptance Criteria

1. THE Application SHALL menggunakan komponen `SidePanel` dari `components/UI/SidePanel.jsx` secara konsisten di seluruh aplikasi, menggantikan penggunaan `SidePanel` lama yang menerima prop `isOpen` di `TenderDetailPanel.jsx`.
2. THE Application SHALL menghapus atau menonaktifkan komponen `TenderDetailPanel.jsx` yang sudah tidak digunakan karena fungsionalitasnya telah digantikan oleh `TenderDetail.jsx` yang dipanggil dari `AppShell`.
3. THE Application SHALL menghapus atau menonaktifkan komponen `Sidebar.jsx` lama di `components/Layout/Sidebar.jsx` yang sudah tidak digunakan karena navigasi telah dipindahkan ke dalam `AppShell.jsx`.
4. THE Application SHALL menghapus atau menonaktifkan komponen `Dashboard/index.jsx` (`KpiCard`, `ActivityFeed`, `WinrateChart`) yang sudah tidak digunakan karena fungsionalitasnya telah digantikan oleh komponen di `DashboardPage.jsx` dan `components/UI/index.jsx`.
5. WHEN komponen `TenderTable.jsx` digunakan, THE TenderTable SHALL mengimpor konstanta warna (`portfolioColor`, `internalStatusColor`, `levelColor`) dari `utils/constants.js`, bukan dari `utils/format.js`, untuk menghindari duplikasi definisi konstanta.
6. THE Application SHALL memastikan semua konstanta (`PRAKUAL_STAGES`, `PASCAKUAL_STAGES`, `portfolioColor`, dll.) hanya didefinisikan di satu tempat yaitu `utils/constants.js`, dan `utils/format.js` tidak menduplikasi definisi yang sama.

---

### Requirement 3: Perbaikan Navigasi Mobile dan Responsivitas

**User Story:** Sebagai pengguna yang mengakses TenderHub dari perangkat mobile, saya ingin dapat menavigasi antar halaman dengan mudah tanpa sidebar yang menghalangi konten, sehingga pengalaman di layar kecil tetap nyaman.

#### Acceptance Criteria

1. WHEN pengguna membuka aplikasi di layar dengan lebar kurang dari 768px, THE AppShell SHALL menyembunyikan sidebar secara default dan menampilkan tombol hamburger menu di header mobile.
2. WHEN pengguna mengetuk tombol hamburger menu di mobile, THE AppShell SHALL menampilkan sidebar sebagai overlay di atas konten dengan backdrop semi-transparan.
3. WHEN pengguna mengetuk item navigasi di sidebar mobile, THE AppShell SHALL menutup sidebar secara otomatis setelah navigasi berhasil.
4. WHEN pengguna mengetuk area backdrop di luar sidebar mobile, THE AppShell SHALL menutup sidebar.
5. WHILE sidebar mobile terbuka, THE AppShell SHALL mencegah scroll pada konten di belakang sidebar.
6. THE AppShell SHALL menggunakan ikon hamburger (Menu) yang konsisten sebagai tombol toggle sidebar di mobile, bukan ikon `LayoutDashboard` yang saat ini digunakan.
7. WHEN layar di-resize dari mobile ke desktop (lebar >= 768px), THE AppShell SHALL membuka sidebar secara otomatis tanpa memerlukan interaksi pengguna.

---

### Requirement 4: Peningkatan Informasi di Halaman Status Tender

**User Story:** Sebagai PIC tender, saya ingin halaman Status Tender menampilkan informasi yang lebih lengkap dan actionable, sehingga saya dapat memantau progres tender yang diprioritaskan dengan lebih efektif.

#### Acceptance Criteria

1. THE Status_Page SHALL menampilkan kartu tender dengan informasi deadline (sisa hari) menggunakan komponen `CountdownBadge` yang sudah tersedia.
2. THE Status_Page SHALL menampilkan nama PIC yang di-assign untuk setiap tender jika tersedia di `assignedPICs`.
3. THE Status_Page SHALL menampilkan nilai HPS tender menggunakan fungsi `formatRupiah` pada setiap kartu tender.
4. WHEN tidak ada tender berstatus "Sudah Diikuti" maupun "Akan Diikuti", THE Status_Page SHALL menampilkan ilustrasi atau pesan kosong yang informatif dengan tautan langsung ke halaman Tender Intelligence.
5. THE Status_Page SHALL menampilkan section tambahan untuk tender berstatus "Menang" dan "Kalah" selain "Sudah Diikuti" dan "Akan Diikuti", sehingga semua status yang relevan terpantau dalam satu halaman.
6. WHEN pengguna mengklik kartu tender di Status Page, THE Status_Page SHALL membuka SidePanel detail tender yang sama seperti di halaman Tender Intelligence.

---

### Requirement 5: Peningkatan UX Panel Detail Tender

**User Story:** Sebagai pengguna yang mereview detail tender, saya ingin panel detail menampilkan informasi yang lebih lengkap dan mudah dibaca, sehingga saya dapat membuat keputusan go/no-go dengan cepat.

#### Acceptance Criteria

1. THE TenderDetail_Panel SHALL menampilkan progress bar tahapan tender yang menunjukkan posisi tahap saat ini secara visual di bagian atas panel, sebelum daftar detail informasi.
2. WHEN tender memiliki `jadwalTahapan` dari API INAPROC, THE TenderDetail_Panel SHALL menampilkan tanggal mulai dan tanggal akhir yang aktual untuk setiap tahapan, bukan tanggal estimasi yang dihitung dari `dateFrom`.
3. THE TenderDetail_Panel SHALL menampilkan opsi status internal yang lengkap sesuai `INTERNAL_STATUS_OPTIONS` yaitu: Dipantau, Akan Diikuti, Sudah Diikuti, Menang, Kalah, Tidak Relevan — bukan hanya 4 opsi yang saat ini tersedia.
4. WHEN pengguna mengubah status internal tender di panel detail, THE TenderDetail_Panel SHALL menyimpan perubahan secara otomatis tanpa memerlukan tombol simpan terpisah untuk field status.
5. THE TenderDetail_Panel SHALL menampilkan nama PIC yang sudah di-assign (jika ada) di bagian Assign PIC, bukan hanya dropdown kosong.
6. WHEN catatan internal sudah tersimpan, THE TenderDetail_Panel SHALL menampilkan timestamp penyimpanan terakhir di bawah textarea catatan.

---

### Requirement 6: Peningkatan Filter dan Pencarian di Tender Intelligence

**User Story:** Sebagai pengguna yang mencari tender spesifik, saya ingin filter di halaman Tender Intelligence lebih intuitif dan tidak membingungkan, sehingga saya dapat menemukan tender yang relevan dengan cepat.

#### Acceptance Criteria

1. THE Tender_Intelligence_Page SHALL menampilkan jumlah hasil filter secara real-time di subtitle halaman setiap kali filter berubah.
2. WHEN semua filter aktif menghasilkan nol tender, THE Tender_Intelligence_Page SHALL menampilkan pesan yang menjelaskan filter mana yang mungkin terlalu ketat, beserta tombol "Reset Filter".
3. THE Tender_Intelligence_Page SHALL menampilkan indikator visual (badge atau highlight) pada tombol filter yang sedang aktif (bukan nilai default "Semua").
4. WHEN pengguna mengaktifkan filter "Hanya tender sesuai keyword" namun tidak ada keyword aktif, THE Tender_Intelligence_Page SHALL menampilkan peringatan inline bahwa tidak ada keyword aktif dan menawarkan tautan ke halaman Pengaturan.
5. THE Tender_Intelligence_Page SHALL mempertahankan state filter yang aktif ketika pengguna membuka dan menutup SidePanel detail tender, sehingga filter tidak ter-reset.
6. WHEN pengguna mengetik di kolom pencarian, THE Tender_Intelligence_Page SHALL menampilkan hasil pencarian setelah jeda 300ms (debounce) untuk menghindari re-render berlebihan.

---

### Requirement 7: Peningkatan Visualisasi Winrate dan Statistik

**User Story:** Sebagai manajer SBU LSI, saya ingin data winrate yang ditampilkan di Dashboard mencerminkan data tender aktual dari sistem, sehingga saya dapat membuat keputusan strategis berdasarkan data yang akurat.

#### Acceptance Criteria

1. THE Dashboard SHALL menghitung winrate secara dinamis dari data tender yang memiliki `internalStatus` bernilai "Menang" atau "Kalah", bukan dari konstanta `WINRATE_SERIES` yang statis.
2. THE Winrate_Detail_Panel SHALL menampilkan breakdown winrate per portofolio (FLP, SDA, FITI) selain winrate keseluruhan.
3. WHEN tidak ada data tender dengan status "Menang" atau "Kalah", THE Dashboard SHALL menampilkan winrate sebesar 0% dengan pesan "Belum ada data historis" di panel winrate.
4. THE Dashboard SHALL menampilkan total nilai kontrak tender yang dimenangkan (akumulasi HPS tender berstatus "Menang") sebagai metrik tambahan di panel winrate.
5. WHEN pengguna mengklik kartu KPI "Total Tender Aktif", THE Dashboard SHALL membuka panel Potensi Chart yang menampilkan distribusi semua tender aktif.

---

### Requirement 8: Aksesibilitas dan Standar Komponen UI

**User Story:** Sebagai pengguna dengan kebutuhan aksesibilitas, saya ingin semua elemen interaktif di TenderHub dapat diakses dengan keyboard dan memiliki label yang jelas, sehingga aplikasi dapat digunakan oleh semua orang.

#### Acceptance Criteria

1. THE Application SHALL memastikan semua tombol interaktif memiliki atribut `aria-label` yang deskriptif, terutama tombol ikon tanpa teks seperti tombol close (×) di SidePanel dan tombol hapus keyword.
2. THE Application SHALL memastikan semua elemen `<select>` memiliki `<label>` yang terhubung melalui atribut `htmlFor` dan `id`, atau menggunakan `aria-label`.
3. THE Application SHALL memastikan urutan fokus keyboard (tab order) yang logis di setiap halaman, mengikuti urutan visual dari atas ke bawah dan kiri ke kanan.
4. THE Application SHALL memastikan rasio kontras warna teks terhadap latar belakang memenuhi standar WCAG AA (minimum 4.5:1 untuk teks normal, 3:1 untuk teks besar) pada semua komponen Badge, KpiCard, dan teks informasi.
5. THE SidePanel SHALL mengembalikan fokus ke elemen pemicu (trigger element) ketika panel ditutup, sehingga pengguna keyboard tidak kehilangan posisi fokus.
6. WHEN SidePanel terbuka, THE SidePanel SHALL menjebak fokus keyboard di dalam panel (focus trap) sehingga pengguna tidak dapat men-tab ke konten di belakang panel.

---

### Requirement 9: Peningkatan Halaman RUP Pipeline

**User Story:** Sebagai pengguna yang memantau RUP, saya ingin halaman RUP Pipeline menampilkan informasi yang lebih kontekstual dan mudah diprioritaskan, sehingga saya dapat mengidentifikasi paket RUP yang paling mendesak untuk ditindaklanjuti.

#### Acceptance Criteria

1. THE RUP_Pipeline_Page SHALL menampilkan indikator "Segera" (badge merah) pada paket RUP yang memiliki `daysUntilSelection` kurang dari atau sama dengan 30 hari.
2. THE RUP_Pipeline_Page SHALL menampilkan kolom "Kesiapan" (readiness score) dari hasil kalkulasi `calcRupMatch` sebagai progress bar visual di tabel RUP.
3. WHEN pengguna mengklik nama paket RUP di tabel, THE RUP_Pipeline_Page SHALL membuka SidePanel detail RUP yang sama seperti tombol "Detail".
4. THE RUP_Pipeline_Page SHALL menampilkan jumlah keyword yang cocok (`matched.length`) sebagai informasi tambahan di bawah nama paket RUP di tabel.
5. WHEN filter "Hanya RUP sesuai keyword" diaktifkan dan tidak ada keyword aktif, THE RUP_Pipeline_Page SHALL menampilkan peringatan bahwa filter keyword tidak efektif karena tidak ada keyword aktif.
6. THE RUP_Pipeline_Page SHALL mempertahankan posisi scroll tabel ketika pengguna membuka dan menutup SidePanel detail RUP.

---

### Requirement 10: Peningkatan Halaman Database Tenaga Ahli

**User Story:** Sebagai koordinator tender, saya ingin halaman Database Tenaga Ahli menampilkan informasi ketersediaan dan keahlian yang lebih mudah dibaca, sehingga saya dapat dengan cepat menemukan tenaga ahli yang tepat untuk proposal tender.

#### Acceptance Criteria

1. THE Expert_Page SHALL menampilkan filter berdasarkan portofolio (FLP, SDA, FITI) selain filter ketersediaan yang sudah ada, sehingga pengguna dapat menyaring tenaga ahli berdasarkan bidang keahlian.
2. THE Expert_Page SHALL menampilkan jumlah proyek yang pernah dikerjakan (`expert.proyek`) sebagai informasi tambahan di kartu/baris tenaga ahli.
3. WHEN pengguna mengisi form tambah tenaga ahli dan mengklik "Simpan" tanpa mengisi field wajib (nama atau keahlian), THE Expert_Page SHALL menampilkan pesan validasi inline di bawah field yang kosong, bukan hanya diam tanpa respons.
4. THE Expert_Detail_Panel SHALL menampilkan tab atau section terpisah untuk "Profil", "Riwayat Pekerjaan", dan "Review", sehingga konten panel tidak terlalu panjang dan mudah dinavigasi.
5. WHEN pengguna menambahkan riwayat pekerjaan baru, THE Expert_Detail_Panel SHALL mengosongkan form riwayat secara otomatis setelah data berhasil disimpan.
6. THE Expert_Page SHALL menampilkan avatar dengan warna yang konsisten berdasarkan ID tenaga ahli, menggunakan modulo dari `avatarColors` array yang sudah tersedia.

---

### Requirement 11: Peningkatan Halaman Pengaturan

**User Story:** Sebagai admin SBU LSI, saya ingin halaman Pengaturan memiliki feedback yang jelas setiap kali saya menyimpan perubahan, sehingga saya yakin bahwa konfigurasi sudah tersimpan dengan benar.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Simpan" pada Threshold HPS, THE Settings_Page SHALL menampilkan toast notifikasi "Threshold HPS tersimpan: Rp X juta" yang menyertakan nilai yang disimpan.
2. WHEN pengguna menambahkan keyword baru dan menekan Enter di input field, THE Settings_Page SHALL menyimpan keyword tersebut tanpa harus mengklik tombol "Tambah".
3. WHEN pengguna menghapus keyword, THE Settings_Page SHALL menampilkan konfirmasi singkat (toast) "Keyword '[nama]' dihapus dari [portofolio]".
4. THE Settings_Page SHALL menampilkan total jumlah keyword aktif per portofolio secara real-time di header setiap section keyword.
5. WHEN pengguna menambahkan pengguna baru tanpa mengisi nama, THE Settings_Page SHALL menampilkan pesan validasi "Nama pengguna tidak boleh kosong" dan mencegah penyimpanan.
6. THE Settings_Page SHALL menampilkan notifikasi perubahan yang belum disimpan (unsaved changes indicator) ketika pengguna mengubah Coverage Wilayah sebelum meninggalkan halaman.

---

### Requirement 12: Konsistensi Visual dan Design System

**User Story:** Sebagai pengguna yang menggunakan TenderHub setiap hari, saya ingin tampilan visual yang konsisten di seluruh halaman, sehingga saya tidak perlu beradaptasi ulang setiap berpindah halaman.

#### Acceptance Criteria

1. THE Application SHALL menggunakan komponen `Card` dari `components/UI/index.jsx` secara konsisten di seluruh halaman, dengan `border-radius` yang seragam (rounded-lg = 8px).
2. THE Application SHALL menggunakan komponen `Btn` dari `components/UI/index.jsx` untuk semua tombol interaktif, menggantikan penggunaan elemen `<button>` dengan class CSS manual yang tidak konsisten.
3. THE Application SHALL memastikan semua teks label section menggunakan pola yang konsisten: `text-[11px] font-extrabold uppercase tracking-widest text-slate-500` untuk label seksi, dan `text-base font-extrabold tracking-tight` untuk judul kartu.
4. THE Application SHALL memastikan semua input field menggunakan class yang konsisten: `border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none`.
5. THE Application SHALL memastikan warna portofolio (FLP=blue, SDA=green, FITI=amber) diterapkan secara konsisten di semua halaman dan komponen yang menampilkan informasi portofolio.
6. THE Application SHALL memastikan komponen `TenderTimeline` di `TenderDetail.jsx` menggunakan data tahapan dari `PRAKUAL_STAGES` atau `PASCAKUAL_STAGES` di `constants.js`, bukan dari `format.js`, untuk menghindari ketidakkonsistenan jika salah satu file diperbarui.

---

### Requirement 13: Penghapusan Logo Sucofindo

**User Story:** Sebagai pengguna aplikasi LSI Tender Intelligence, saya ingin tampilan header aplikasi tidak menampilkan logo Sucofindo, sehingga branding aplikasi lebih fokus pada identitas LSI.

#### Acceptance Criteria

1. THE AppShell SHALL menghapus elemen gambar logo Sucofindo dari header aplikasi di pojok kiri atas.
2. THE AppShell SHALL mempertahankan judul aplikasi "LSI Tender Intelligence" atau "TenderHub" di header tanpa logo Sucofindo.
3. WHEN header aplikasi dirender, THE AppShell SHALL menampilkan hanya teks judul aplikasi atau logo LSI (jika tersedia) di posisi kiri atas.

---

### Requirement 14: Perubahan Distribusi Provinsi ke Distribusi Instansi

**User Story:** Sebagai pengguna Dashboard, saya ingin melihat distribusi tender berdasarkan instansi pemerintah bukan provinsi, sehingga saya dapat memahami instansi mana yang paling aktif mengadakan tender dan dapat memfilter tender berdasarkan instansi tersebut.

#### Acceptance Criteria

1. THE Dashboard SHALL mengganti judul section "Distribusi Tender per Provinsi" menjadi "Distribusi Tender per Instansi".
2. THE Dashboard SHALL menampilkan daftar instansi pemerintah (seperti "Pemprov Jabar", "Kementerian Perindustrian", "Kementerian PUPR", dll.) beserta jumlah tender aktif dari masing-masing instansi, diurutkan dari jumlah terbanyak ke paling sedikit.
3. THE Dashboard SHALL menampilkan maksimal 10 instansi teratas berdasarkan jumlah tender aktif di section distribusi instansi.
4. WHEN pengguna mengklik bar atau nama instansi di section distribusi instansi, THE Dashboard SHALL menavigasi ke halaman Tender Intelligence dengan filter instansi yang sesuai sudah aktif.
5. THE Dashboard SHALL menghitung distribusi instansi dari field `instansi` atau `nama_klpd` pada data tender yang sudah dimuat.
6. WHEN tidak ada data tender yang tersedia, THE Dashboard SHALL menampilkan pesan "Belum ada data distribusi instansi" di section distribusi instansi.

---

### Requirement 15: Perbaikan Kolom Deadline di Tender Intelligence

**User Story:** Sebagai pengguna halaman Tender Intelligence, saya ingin kolom deadline menampilkan informasi yang akurat dan konsisten, sehingga saya dapat memprioritaskan tender berdasarkan deadline yang benar.

#### Acceptance Criteria

1. THE TenderTable SHALL menampilkan deadline tahap tender saat ini (`deadlineStage`) di kolom Deadline menggunakan komponen `CountdownBadge`.
2. WHEN tender memiliki `daysLeft` kurang dari atau sama dengan 7, THE TenderTable SHALL menampilkan badge deadline dengan warna merah dan label "X hari lagi".
3. WHEN tender memiliki `daysLeft` antara 8 hingga 14, THE TenderTable SHALL menampilkan badge deadline dengan warna amber dan label "X hari lagi".
4. WHEN tender memiliki `daysLeft` lebih dari 14, THE TenderTable SHALL menampilkan badge deadline dengan warna hijau dan label "X hari lagi".
5. WHEN tender memiliki `deadlinePassed` bernilai true, THE TenderTable SHALL menampilkan badge deadline dengan warna abu-abu dan label "Terlewat".
6. THE TenderTable SHALL memastikan nilai `deadlineStage` dan `daysLeft` dihitung dari fungsi `enrichTender` di `helpers.js` yang menggunakan data tahapan dari `PRAKUAL_STAGES` atau `PASCAKUAL_STAGES`.

---

### Requirement 16: Penghapusan Teks "Nama tahap" di Status Tender

**User Story:** Sebagai pengguna halaman Status Tender, saya ingin tampilan kartu tender lebih bersih tanpa label redundan "Nama tahap", sehingga informasi lebih mudah dibaca dan tidak membingungkan.

#### Acceptance Criteria

1. THE Status_Page SHALL menghapus teks label "Nama tahap" dari kartu tender di section "Akan Diikuti" dan "Sudah Diikuti".
2. THE Status_Page SHALL menampilkan nama tahap tender saat ini (`currentStageName`) secara langsung tanpa label "Nama tahap:" di depannya.
3. THE Status_Page SHALL memastikan nama tahap tender ditampilkan dengan styling yang konsisten: `text-sm font-semibold text-slate-700`.
4. WHEN kartu tender dirender di Status Page, THE Status_Page SHALL menampilkan nama tahap sebagai bagian dari informasi utama tender, bukan sebagai field terpisah dengan label.

---

### Requirement 17: Penambahan Data Dummy yang Lebih Banyak

**User Story:** Sebagai pengguna yang melakukan demo atau testing aplikasi, saya ingin aplikasi memiliki data dummy yang lebih banyak dan realistis untuk Tenaga Ahli, Tender, dan RUP, sehingga aplikasi terlihat lebih hidup dan representatif untuk presentasi atau pengujian.

#### Acceptance Criteria

1. THE Dummy_Data_Service SHALL menyediakan minimal 50 data tender dummy dengan variasi instansi, provinsi, portofolio, status internal, dan tahapan yang beragam.
2. THE Dummy_Data_Service SHALL menyediakan minimal 30 data RUP dummy dengan variasi instansi, nilai pagu, tanggal pemilihan, dan kesesuaian keyword yang beragam.
3. THE Dummy_Data_Service SHALL menyediakan minimal 20 data tenaga ahli dummy dengan variasi keahlian, portofolio, ketersediaan, dan riwayat proyek yang beragam.
4. THE Dummy_Data_Service SHALL memastikan data dummy tender mencakup semua tahapan dari `PRAKUAL_STAGES` dan `PASCAKUAL_STAGES` untuk menguji tampilan timeline dan progress bar.
5. THE Dummy_Data_Service SHALL memastikan data dummy tender mencakup semua status internal: Dipantau, Akan Diikuti, Sudah Diikuti, Menang, Kalah, Tidak Relevan.
6. THE Dummy_Data_Service SHALL memastikan data dummy RUP mencakup variasi `daysUntilSelection` dari 1 hingga 365 hari untuk menguji indikator urgensi.
7. THE Dummy_Data_Service SHALL memastikan data dummy tenaga ahli mencakup variasi status ketersediaan: Tersedia, Sibuk, Cuti, untuk menguji filter ketersediaan.
8. THE Dummy_Data_Service SHALL menggunakan nama instansi yang realistis seperti "Kementerian PUPR", "Pemprov Jawa Barat", "Kementerian Kesehatan", "Bappenas", "DPMPTSP Kota Bandung", dll.
9. THE Dummy_Data_Service SHALL menggunakan nama paket tender dan RUP yang realistis dan bervariasi sesuai dengan portofolio (FLP, SDA, FITI).
10. THE Dummy_Data_Service SHALL memastikan distribusi data dummy mencerminkan proporsi yang realistis: 40% FLP, 35% SDA, 25% FITI untuk portofolio tender.
