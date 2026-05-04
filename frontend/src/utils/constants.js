// Semua konstanta dari mockup index.html

// TODAY is a getter function that always returns the current date
// This ensures daysLeft calculations update correctly each day
export const TODAY = (() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
})();

export const portfolioColor = { FLP: 'blue', SDA: 'green', FITI: 'amber' };
export const internalStatusColor = { 'Dipantau': 'gray', 'Akan Diikuti': 'amber', 'Sudah Diikuti': 'green', 'Tidak Relevan': 'red' };
export const levelColor = { 'K/L': 'gray', 'Provinsi': 'blue', 'Kab/Kota': 'teal' };
export const availabilityColor = { 'Tersedia': 'green', 'Sedang Bertugas': 'amber', 'Tidak Tersedia': 'red' };
export const avatarColors = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0e7490', '#be123c', '#0369a1', '#15803d'];
export const INTERNAL_STATUS_OPTIONS = ['Dipantau', 'Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah', 'Tidak Relevan'];

export const PRAKUAL_STAGES = [
  ['Pengumuman Prakualifikasi', 'gray'],
  ['Download Dokumen Kualifikasi', 'gray'],
  ['Penjelasan Dokumen Prakualifikasi', 'cyan'],
  ['Kirim Persyaratan Kualifikasi', 'blue'],
  ['Evaluasi Dokumen Kualifikasi', 'amber'],
  ['Pembuktian Kualifikasi', 'amber'],
  ['Penetapan Hasil Kualifikasi', 'teal'],
  ['Pengumuman Hasil Prakualifikasi', 'teal'],
  ['Masa Sanggah Prakualifikasi', 'red'],
  ['Download Dokumen Pemilihan', 'blue'],
  ['Pemberian Penjelasan', 'cyan'],
  ['Upload Dokumen Penawaran', 'indigo'],
  ['Pembukaan dan Evaluasi Penawaran File I: Administrasi dan Teknis', 'purple'],
  ['Pengumuman Hasil Evaluasi Administrasi dan Teknis', 'purple'],
  ['Pembukaan dan Evaluasi Penawaran File II: Harga', 'purple'],
  ['Penetapan Pemenang', 'teal'],
  ['Pengumuman Pemenang', 'teal'],
  ['Masa Sanggah', 'red'],
  ['Klarifikasi dan Negosiasi Teknis dan Biaya', 'amber'],
  ['Surat Penunjukan Penyedia Barang/Jasa', 'green'],
  ['Penandatanganan Kontrak', 'green'],
];

export const PASCAKUAL_STAGES = [
  ['Pengumuman Pascakualifikasi', 'gray'],
  ['Download Dokumen Pemilihan', 'blue'],
  ['Pemberian Penjelasan', 'cyan'],
  ['Upload Dokumen Penawaran', 'indigo'],
  ['Pembukaan Dokumen Penawaran', 'purple'],
  ['Evaluasi Administrasi, Kualifikasi, Teknis, dan Harga', 'purple'],
  ['Pembuktian Kualifikasi', 'amber'],
  ['Penetapan Pemenang', 'teal'],
  ['Pengumuman Pemenang', 'teal'],
  ['Masa Sanggah', 'red'],
  ['Surat Penunjukan Penyedia Barang/Jasa', 'green'],
  ['Penandatanganan Kontrak', 'green'],
];

export const PROVINCES = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten', 'Sumatera Utara', 'Sumatera Selatan',
  'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Tenggara', 'Sulawesi Utara', 'NTB', 'Bali', 'Riau', 'Papua'
];

export const WINRATE_SERIES = [
  { label: 'Q1 2025', ikut: 6, menang: 3 },
  { label: 'Q2 2025', ikut: 8, menang: 4 },
  { label: 'Q3 2025', ikut: 7, menang: 5 },
  { label: 'Q4 2025', ikut: 9, menang: 4 },
  { label: 'YTD 2026', ikut: 8, menang: 4 },
];

export const RECENT_ACTIVITY = [
  { tenderId: 1, text: 'Tender baru: Survei Topografi Kawasan Industri Batang', time: '2 jam lalu', color: 'blue' },
  { tenderId: 2, text: 'Deadline mendekat: Pendataan dan Verifikasi Penerima Program Gizi', time: '5 jam lalu', color: 'red' },
  { tenderId: 3, text: 'Status berubah: Penyusunan Masterplan KEK Mandalika', time: '1 hari lalu', color: 'amber' },
  { tenderId: 4, text: 'Tender baru: Inventarisasi Aset Jalur 150kV', time: '1 hari lalu', color: 'blue' },
  { tenderId: 5, text: 'Deadline mendekat: Kajian Pengembangan Bandara Kertajati', time: '2 hari lalu', color: 'amber' },
  { tenderId: 6, text: 'Tahap sanggah: Bush Clearing Kalimantan', time: '2 hari lalu', color: 'green' },
];

export const DEFAULT_USERS = [
  { id: 1, nama: 'Rini Pratiwi', role: 'Admin SBU LSI', email: 'rini.pratiwi@sucofindo.co.id', aktif: true },
  { id: 2, nama: 'Fajar Nugroho', role: 'PIC Tender SDA', email: 'fajar.nugroho@sucofindo.co.id', aktif: true },
  { id: 3, nama: 'Maya Paramitha', role: 'PIC FLP/FITI', email: 'maya.paramitha@sucofindo.co.id', aktif: false },
  { id: 4, nama: 'Andi Wirawan', role: 'Administrator Officer', email: 'andi.wirawan@sucofindo.co.id', aktif: true },
  { id: 5, nama: 'Dwi Rahmawati', role: 'Administrator Officer', email: 'dwi.rahmawati@sucofindo.co.id', aktif: true },
  { id: 6, nama: 'Sari Kusuma', role: 'PIC Tender', email: 'sari.kusuma@sucofindo.co.id', aktif: true },
  { id: 7, nama: 'Budi Santoso', role: 'PIC Tender', email: 'budi.santoso@sucofindo.co.id', aktif: true },
];

export const DEFAULT_KEYWORDS = {
  SDA: ['survei topografi', 'pengadaan tanah', 'ROW SUTT', 'bush clearing', 'inventarisasi aset', 'rehabilitasi', 'DED', 'feasibility study kawasan'].map((text, i) => ({ id: `SDA-${i}`, text, active: true })),
  FLP: ['survei', 'pendataan', 'oversight services', 'instrumen survei', 'kajian kebijakan', 'studi bandara'].map((text, i) => ({ id: `FLP-${i}`, text, active: true })),
  FITI: ['IPRO', 'investment project ready', 'masterplan kawasan', 'roadmap investasi', 'studi kelayakan', 'peta peluang investasi', 'konsultan investasi'].map((text, i) => ({ id: `FITI-${i}`, text, active: true })),
};

export const getStages = (metode) => metode === 'Prakualifikasi' ? PRAKUAL_STAGES : PASCAKUAL_STAGES;
