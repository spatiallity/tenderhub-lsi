// TenderHub LSIv2 - Deployment Version: 2026-05-03 19:19
import { subDays, subMonths, format } from 'date-fns';

// Helper function to generate stage deadlines based on current stage
// LOGIC: Current stage END DATE determines the deadline badge
const generateStageDeadlines = (metode, currentStage, daysUntilDeadline = null, tenderId = 1) => {
  const today = new Date(); // Use actual today
  
  const prakualDurations = [7, 5, 3, 7, 5, 3, 2, 3, 5, 5, 3, 7, 5, 3, 5, 2, 3, 5, 4, 2, 3];
  const pascakualDurations = [7, 5, 3, 7, 5, 7, 3, 2, 3, 5, 2, 3];
  
  const durations = metode === 'Prakualifikasi' ? prakualDurations : pascakualDurations;
  const stageNames = metode === 'Prakualifikasi' ? [
    'Pengumuman Prakualifikasi',
    'Download Dokumen Kualifikasi',
    'Penjelasan Dokumen Prakualifikasi',
    'Kirim Persyaratan Kualifikasi',
    'Evaluasi Dokumen Kualifikasi',
    'Pembuktian Kualifikasi',
    'Penetapan Hasil Kualifikasi',
    'Pengumuman Hasil Prakualifikasi',
    'Masa Sanggah Prakualifikasi',
    'Download Dokumen Pemilihan',
    'Pemberian Penjelasan',
    'Upload Dokumen Penawaran',
    'Pembukaan dan Evaluasi File I',
    'Pengumuman Hasil Evaluasi',
    'Pembukaan dan Evaluasi File II',
    'Penetapan Pemenang',
    'Pengumuman Pemenang',
    'Masa Sanggah',
    'Klarifikasi dan Negosiasi',
    'Surat Penunjukan',
    'Penandatanganan Kontrak'
  ] : [
    'Pengumuman Pascakualifikasi',
    'Download Dokumen Pemilihan',
    'Pemberian Penjelasan',
    'Upload Dokumen Penawaran',
    'Pembukaan Dokumen Penawaran',
    'Evaluasi Administrasi, Kualifikasi, Teknis, dan Harga',
    'Pembuktian Kualifikasi',
    'Penetapan Pemenang',
    'Pengumuman Pemenang',
    'Masa Sanggah',
    'Surat Penunjukan',
    'Penandatanganan Kontrak'
  ];
  
  // STEP 1: Determine when current stage will END (this is the deadline)
  // Add variation based on tender ID to create diverse deadlines
  if (daysUntilDeadline === null) {
    // Create variation: -5 to +20 days from today
    // Use tender ID as seed for consistent but varied results
    const seed = (tenderId * 17 + currentStage * 13) % 26;
    daysUntilDeadline = seed - 5; // Range: -5 to 20 days
  }
  
  // STEP 2: Calculate current stage END date (the deadline)
  const currentStageEndDate = new Date(today);
  currentStageEndDate.setDate(currentStageEndDate.getDate() + daysUntilDeadline);
  
  // STEP 3: Calculate current stage START date
  // Current stage duration is durations[currentStage - 1]
  const currentStageDuration = durations[currentStage - 1];
  const currentStageStartDate = new Date(currentStageEndDate);
  currentStageStartDate.setDate(currentStageStartDate.getDate() - currentStageDuration);
  
  // STEP 4: Calculate project start date (work backwards from current stage start)
  let totalDaysBeforeCurrentStage = 0;
  for (let i = 0; i < currentStage - 1; i++) {
    totalDaysBeforeCurrentStage += durations[i];
  }
  
  const projectStartDate = new Date(currentStageStartDate);
  projectStartDate.setDate(projectStartDate.getDate() - totalDaysBeforeCurrentStage);
  
  // STEP 5: Generate all stage deadlines from project start
  const deadlines = [];
  let runningDate = new Date(projectStartDate);
  
  for (let i = 0; i < durations.length; i++) {
    const stageStart = new Date(runningDate);
    runningDate.setDate(runningDate.getDate() + durations[i]);
    const stageEnd = new Date(runningDate);
    
    deadlines.push({
      stageNo: i + 1,
      name: stageNames[i],
      startDate: stageStart.toISOString().split('T')[0],
      endDate: stageEnd.toISOString().split('T')[0]
    });
  }
  
  return deadlines;
};

// Auto-generate stageDeadlines for tenders that don't have it
const ensureStageDeadlines = (tender) => {
  // ALWAYS regenerate stageDeadlines to ensure fresh data with variation
  if (tender.metode && tender.currentStage) {
    // Use tender.daysUntilDeadline if specified, otherwise use tender ID for variation
    const daysUntil = tender.daysUntilDeadline !== undefined ? tender.daysUntilDeadline : null;
    return {
      ...tender,
      stageDeadlines: generateStageDeadlines(tender.metode, tender.currentStage, daysUntil, tender.id)
    };
  }
  return tender;
};

const FALLBACK_TENDERS_RAW = [
  {
    id: 1,
    nama: 'Survei Topografi dan Pemetaan Kawasan Industri Batang',
    instansi: 'Kementerian Perindustrian',
    level: 'K/L',
    lpse: 'https://spse.inaproc.id/kemenperin',
    hps: 4800000000,
    pagu: 5294237950,
    metode: 'Prakualifikasi',
    currentStage: 3,

    provinsi: 'Jawa Tengah',
    portofolio: 'SDA',
    internalStatus: 'Akan Diikuti',
    followed: true,
    won: false,
    changes: { 3: 1 },
    nama_satker: 'Biro Kerjasama dan Investasi',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'KEMENTERIAN',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Pagu Anggaran',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBN',
    kontrak_pembayaran: 'Lumsum',
    kd_tender: 169154,
    kd_rup: '27228392',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-03-26',
    lokasi_pekerjaan: 'Industri Batang - Jawa Tengah',
    nama_ppk: 'Rizki Aditya, S.T., M.T.',
    nama_pokja: 'Pokja UKPBJ III',
  },
  {
    id: 2,
    nama: 'Pendataan dan Verifikasi Penerima Program Gizi Nasional',
    instansi: 'Kementerian Kesehatan',
    level: 'K/L',
    lpse: 'https://spse.inaproc.id/kemkes',
    hps: 2350000000,
    pagu: 2600855468,
    metode: 'Prakualifikasi',
    currentStage: 7,

    provinsi: 'DKI Jakarta',
    portofolio: 'FLP',
    internalStatus: 'Sudah Diikuti',
    followed: true,
    won: false,
    changes: { 6: 2, 7: 1 },
    nama_satker: 'Balai Besar Kerjasama dan Investasi',
    jenis_pengadaan: 'Jasa Lainnya',
    jenis_klpd: 'KEMENTERIAN',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Kualitas dan Biaya',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBN',
    kontrak_pembayaran: 'Terima Jadi',
    kd_tender: 429518,
    kd_rup: '89109877',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-03-30',
    lokasi_pekerjaan: 'Gizi Nasional - DKI Jakarta',
    nama_ppk: 'Wahyu Setiawan, S.E., M.Ak.',
    nama_pokja: 'Pokja Konsultansi',
  },
  {
    id: 3,
    nama: 'Penyusunan Masterplan Kawasan Ekonomi Khusus Mandalika',
    instansi: 'Kementerian Investasi/BKPM',
    level: 'K/L',
    lpse: 'https://spse.inaproc.id/bkpm',
    hps: 7200000000,
    pagu: 7422288709,
    metode: 'Prakualifikasi',
    currentStage: 1,
    provinsi: 'NTB',
    portofolio: 'FITI',
    internalStatus: 'Dipantau',
    followed: false,
    won: false,
    changes: {},
    nama_satker: 'Balai Besar Perwilayahan',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'KEMENTERIAN',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Kualitas dan Biaya',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Besar',
    sumber_dana: 'APBN',
    kontrak_pembayaran: 'Harga Satuan',
    kd_tender: 592626,
    kd_rup: '65338994',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-07',
    lokasi_pekerjaan: 'Mandalika - NTB',
    nama_ppk: 'Ir. Ahmad Fauzan, M.T.',
    nama_pokja: 'Pokja UKPBJ I',
  },
  {
    id: 4,
    nama: 'Inventarisasi Aset dan Pengadaan Tanah Jalur 150kV',
    instansi: 'Kementerian PUPR',
    level: 'K/L',
    lpse: 'https://spse.inaproc.id/pu',
    hps: 3600000000,
    pagu: 3614224566,
    metode: 'Prakualifikasi',
    currentStage: 9,
    provinsi: 'Jawa Barat',
    portofolio: 'SDA',
    internalStatus: 'Sudah Diikuti',
    followed: true,
    won: false,
    changes: { 8: 1, 9: 2 },
    nama_satker: 'Pusat Data Pelayanan Teknis',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'KEMENTERIAN',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Pagu Anggaran',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBN',
    kontrak_pembayaran: 'Terima Jadi',
    kd_tender: 776253,
    kd_rup: '87237943',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-03-19',
    lokasi_pekerjaan: 'Jalur 150kV - Jawa Barat',
    nama_ppk: 'Ir. Ahmad Fauzan, M.T.',
    nama_pokja: 'Pokja Jasa Lainnya',
  },
  {
    id: 5,
    nama: 'Kajian Kelayakan Pengembangan Bandara Internasional Kertajati',
    instansi: 'Dinas Perhubungan Prov. Jawa Barat',
    level: 'Provinsi',
    lpse: 'https://spse.inaproc.id/jabarprov',
    hps: 1850000000,
    pagu: 2097046778,
    metode: 'Pascakualifikasi',
    currentStage: 4,
    provinsi: 'Jawa Barat',
    portofolio: 'FLP',
    internalStatus: 'Akan Diikuti',
    followed: true,
    won: false,
    changes: { 4: 1 },
    nama_satker: 'Sekretariat Pelayanan Teknis',
    jenis_pengadaan: 'Jasa Lainnya',
    jenis_klpd: 'PEMERINTAH PROVINSI',
    mtd_pemilihan: 'Tender',
    mtd_evaluasi: 'Harga Terendah Sistem Gugur',
    mtd_kualifikasi: 'Pasca Kualifikasi Satu File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBD',
    kontrak_pembayaran: 'Lumsum',
    kd_tender: 385455,
    kd_rup: '97174327',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-03-25',
    lokasi_pekerjaan: 'Kertajati - Jawa Barat',
    nama_ppk: 'Bambang Hermanto, S.T., M.Eng.',
    nama_pokja: 'Pokja Pemilihan 01',
  },
  {
    id: 6,
    nama: 'Bush Clearing dan Pembebasan Lahan Kalimantan',
    instansi: 'Kementerian LHK',
    level: 'K/L',
    lpse: 'https://spse.inaproc.id/menlhk',
    hps: 9500000000,
    pagu: 10489969042,
    metode: 'Prakualifikasi',
    currentStage: 2,
    provinsi: 'Kalimantan Timur',
    portofolio: 'SDA',
    internalStatus: 'Dipantau',
    followed: false,
    won: false,
    changes: {},
    nama_satker: 'Pusat Data Kerjasama dan Investasi',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'KEMENTERIAN',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Biaya Terendah',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Besar',
    sumber_dana: 'APBN',
    kontrak_pembayaran: 'Harga Satuan',
    kd_tender: 625633,
    kd_rup: '64885726',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-09',
    lokasi_pekerjaan: 'Kalimantan Timur',
    nama_ppk: 'Bambang Hermanto, S.T., M.Eng.',
    nama_pokja: 'Pokja UKPBJ I',
  },
  {
    id: 7,
    nama: 'Pemetaan Risiko Banjir dan DED Drainase Kawasan Industri Cirebon',
    instansi: 'Dinas Sumber Daya Air Prov. Jawa Barat',
    level: 'Provinsi',
    lpse: 'https://spse.inaproc.id/jabarprov',
    hps: 4150000000,
    pagu: 4380000000,
    metode: 'Prakualifikasi',
    currentStage: 4,
    provinsi: 'Jawa Barat',
    portofolio: 'SDA',
    internalStatus: 'Akan Diikuti',
    followed: true,
    won: false,
    changes: { 4: 1 },
    nama_satker: 'UPTD Pengelolaan Sumber Daya Air Wilayah Cimanuk',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'PEMERINTAH PROVINSI',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Kualitas dan Biaya',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBD',
    kontrak_pembayaran: 'Lumsum',
    kd_tender: 731248,
    kd_rup: '60125007',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-18',
    lokasi_pekerjaan: 'Cirebon - Jawa Barat',
    nama_ppk: 'Ir. Dewi Mulyani, M.T.',
    nama_pokja: 'Pokja SDA Jabar',
  },
  {
    id: 8,
    nama: 'Survei Kepuasan Masyarakat dan Evaluasi Pelayanan Perizinan Terpadu',
    instansi: 'DPMPTSP Provinsi DKI Jakarta',
    level: 'Provinsi',
    lpse: 'https://spse.inaproc.id/dkijakarta',
    hps: 1250000000,
    pagu: 1400000000,
    metode: 'Pascakualifikasi',
    currentStage: 3,
    provinsi: 'DKI Jakarta',
    portofolio: 'FLP',
    internalStatus: 'Dipantau',
    followed: false,
    won: false,
    changes: {},
    nama_satker: 'Bidang Data dan Pengaduan',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'PEMERINTAH PROVINSI',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Kualitas dan Biaya',
    mtd_kualifikasi: 'Pasca Kualifikasi Satu File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBD',
    kontrak_pembayaran: 'Lumsum',
    kd_tender: 731249,
    kd_rup: '60125008',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-20',
    lokasi_pekerjaan: 'Jakarta',
    nama_ppk: 'Nadia Safitri, S.Sos., M.P.A.',
    nama_pokja: 'Pokja Layanan Publik',
  },
  {
    id: 9,
    nama: 'Penyusunan Peta Peluang Investasi Pariwisata Bahari Sulawesi Utara',
    instansi: 'Kementerian Investasi/BKPM',
    level: 'K/L',
    lpse: 'https://spse.inaproc.id/bkpm',
    hps: 5650000000,
    pagu: 5900000000,
    metode: 'Prakualifikasi',
    currentStage: 10,
    provinsi: 'Sulawesi Utara',
    portofolio: 'FITI',
    internalStatus: 'Sudah Diikuti',
    followed: true,
    won: false,
    changes: { 9: 1, 10: 1 },
    nama_satker: 'Direktorat Perencanaan Penanaman Modal',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'KEMENTERIAN',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Kualitas dan Biaya',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Besar',
    sumber_dana: 'APBN',
    kontrak_pembayaran: 'Harga Satuan',
    kd_tender: 731250,
    kd_rup: '60125009',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-11',
    lokasi_pekerjaan: 'Likupang - Sulawesi Utara',
    nama_ppk: 'Hendra Permana, S.E., M.M.',
    nama_pokja: 'Pokja Investasi II',
  },
  {
    id: 10,
    nama: 'Inventarisasi ROW SUTT dan Verifikasi Aset Jaringan Transmisi Banten',
    instansi: 'PT PLN (Persero) UIP Jawa Bagian Barat',
    level: 'K/L',
    lpse: 'https://eproc.pln.co.id',
    hps: 6200000000,
    pagu: 6500000000,
    metode: 'Pascakualifikasi',
    currentStage: 5,
    provinsi: 'Banten',
    portofolio: 'SDA',
    internalStatus: 'Tidak Relevan',
    followed: false,
    won: false,
    changes: { 5: 1 },
    nama_satker: 'Unit Pelaksana Proyek Transmisi',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'BUMN',
    mtd_pemilihan: 'Tender',
    mtd_evaluasi: 'Harga Terendah Sistem Gugur',
    mtd_kualifikasi: 'Pasca Kualifikasi Satu File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'BUMN',
    kontrak_pembayaran: 'Harga Satuan',
    kd_tender: 731251,
    kd_rup: '60125010',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-05',
    lokasi_pekerjaan: 'Serang - Banten',
    nama_ppk: 'Raka Pradipta, S.T.',
    nama_pokja: 'Pokja Transmisi',
  },
  {
    id: 11,
    nama: 'Kajian Kebijakan Penguatan UMKM Pangan dan Instrumen Survei Lapangan',
    instansi: 'Kementerian Koperasi dan UKM',
    level: 'K/L',
    lpse: 'https://spse.inaproc.id/kemenkopukm',
    hps: 2750000000,
    pagu: 3000000000,
    metode: 'Prakualifikasi',
    currentStage: 1,
    provinsi: 'Jawa Timur',
    portofolio: 'FLP',
    internalStatus: 'Dipantau',
    followed: false,
    won: false,
    changes: {},
    nama_satker: 'Deputi Bidang Usaha Mikro',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'KEMENTERIAN',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Pagu Anggaran',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBN',
    kontrak_pembayaran: 'Lumsum',
    kd_tender: 731252,
    kd_rup: '60125011',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-24',
    lokasi_pekerjaan: 'Surabaya - Jawa Timur',
    nama_ppk: 'Mira Kartika, S.E.',
    nama_pokja: 'Pokja Kajian Kebijakan',
  },
  {
    id: 12,
    nama: 'Feasibility Study Kawasan Industri Hilirisasi Rumput Laut Nusa Tenggara Barat',
    instansi: 'Pemprov NTB',
    level: 'Provinsi',
    lpse: 'https://spse.inaproc.id/ntbprov',
    hps: 3350000000,
    pagu: 3600000000,
    metode: 'Prakualifikasi',
    currentStage: 2,
    provinsi: 'NTB',
    portofolio: 'FITI',
    internalStatus: 'Akan Diikuti',
    followed: true,
    won: false,
    changes: { 2: 1 },
    nama_satker: 'Bappeda Provinsi NTB',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'PEMERINTAH PROVINSI',
    mtd_pemilihan: 'Seleksi',
    mtd_evaluasi: 'Kualitas dan Biaya',
    mtd_kualifikasi: 'Pra Kualifikasi Dua File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBD',
    kontrak_pembayaran: 'Lumsum',
    kd_tender: 731253,
    kd_rup: '60125012',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-22',
    lokasi_pekerjaan: 'Lombok Timur - NTB',
    nama_ppk: 'Teguh Wiratama, S.T., M.Si.',
    nama_pokja: 'Pokja Perencanaan Daerah',
  },
];

// Generator function to create additional dummy tenders
const generateAdditionalTenders = (startId, count) => {
  const tenderTemplates = [
    { prefix: 'Survei dan Pemetaan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    { prefix: 'Kajian Kelayakan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
    { prefix: 'Feasibility Study', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
    { prefix: 'Penyusunan Masterplan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
    { prefix: 'DED dan Supervisi', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    { prefix: 'Pendataan dan Verifikasi', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
    { prefix: 'Evaluasi dan Monitoring', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
    { prefix: 'Inventarisasi Aset', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    { prefix: 'Pemetaan Risiko', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    { prefix: 'Studi Kelayakan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
  ];

  const subjects = [
    'Kawasan Industri', 'Infrastruktur Jalan', 'Jaringan Transmisi', 'Sistem Drainase',
    'Pelabuhan', 'Bandara', 'Terminal', 'Jembatan', 'Bendungan', 'Irigasi',
    'Kawasan Ekonomi Khusus', 'Pariwisata', 'Energi Terbarukan', 'Rumah Sakit',
    'Gedung Perkantoran', 'Pasar Rakyat', 'Perumahan', 'Pendidikan', 'Olahraga',
    'Pertanian', 'Perikanan', 'Kehutanan', 'Pertambangan', 'Migas'
  ];

  const provinces = [
    'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DKI Jakarta', 'Banten',
    'Sumatera Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Riau', 'Lampung',
    'Kalimantan Timur', 'Kalimantan Selatan', 'Kalimantan Barat', 'Kalimantan Tengah',
    'Sulawesi Selatan', 'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Tenggara',
    'Bali', 'NTB', 'NTT', 'Papua', 'Papua Barat', 'Maluku', 'Maluku Utara'
  ];

  const instansiKL = [
    'Kementerian PUPR', 'Kementerian Perhubungan', 'Kementerian ESDM',
    'Kementerian Perindustrian', 'Kementerian Investasi/BKPM', 'Kementerian Kesehatan',
    'Kementerian Pendidikan', 'Kementerian Pertanian', 'Kementerian Kelautan dan Perikanan',
    'Kementerian LHK', 'Kementerian Koperasi dan UKM', 'Kementerian Pariwisata'
  ];

  const instansiProv = [
    'Dinas PUPR', 'Dinas Perhubungan', 'Dinas Perindustrian', 'DPMPTSP',
    'Bappeda', 'Dinas Kesehatan', 'Dinas Pendidikan', 'Dinas Pertanian',
    'Dinas Kelautan dan Perikanan', 'Dinas Pariwisata'
  ];

  const cities = [
    'Bandung', 'Semarang', 'Surabaya', 'Medan', 'Palembang', 'Makassar',
    'Balikpapan', 'Samarinda', 'Pontianak', 'Manado', 'Denpasar', 'Mataram',
    'Batam', 'Pekanbaru', 'Banjarmasin', 'Yogyakarta', 'Solo', 'Malang',
    'Bogor', 'Tangerang', 'Bekasi', 'Depok', 'Cirebon', 'Tasikmalaya'
  ];

  const namaPPK = [
    'Ir. Ahmad Fauzan, M.T.', 'Bambang Hermanto, S.T., M.Eng.', 'Ir. Dewi Mulyani, M.T.',
    'Nadia Safitri, S.Sos., M.P.A.', 'Hendra Permana, S.E., M.M.', 'Raka Pradipta, S.T.',
    'Mira Kartika, S.E.', 'Teguh Wiratama, S.T., M.Si.', 'Rizki Aditya, S.T., M.T.',
    'Wahyu Setiawan, S.E., M.Ak.', 'Dr. Siti Rahayu, M.T.', 'Ir. Budi Santoso, M.Eng.'
  ];

  const namaPokja = [
    'Pokja UKPBJ I', 'Pokja UKPBJ II', 'Pokja UKPBJ III', 'Pokja Konsultansi',
    'Pokja Jasa Lainnya', 'Pokja Pemilihan 01', 'Pokja SDA', 'Pokja Investasi',
    'Pokja Perencanaan Daerah', 'Pokja Layanan Publik'
  ];

  const internalStatuses = ['Dipantau', 'Akan Diikuti', 'Sudah Diikuti', 'Tidak Relevan'];
  const metodes = ['Prakualifikasi', 'Pascakualifikasi'];
  const levels = ['K/L', 'Provinsi', 'Kab/Kota'];

  // Seeded PRNG for deterministic data generation
  let seed = 42;
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };

  const tenders = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const template = tenderTemplates[i % tenderTemplates.length];
    const subject = subjects[Math.floor(rand() * subjects.length)];
    const province = provinces[Math.floor(rand() * provinces.length)];
    const city = cities[Math.floor(rand() * cities.length)];
    const level = levels[Math.floor(rand() * levels.length)];
    const metode = metodes[Math.floor(rand() * metodes.length)];
    const maxStage = metode === 'Prakualifikasi' ? 21 : 12;
    
    let currentStage = Math.floor(rand() * Math.min(10, maxStage)) + 1;
    let status = internalStatuses[Math.floor(rand() * internalStatuses.length)];
    let won = status === 'Sudah Diikuti' && rand() > 0.7;

    if (won) {
        currentStage = metode === 'Prakualifikasi' ? 20 : 11;
        status = 'Menang';
    }
    
    const hps = (Math.floor(rand() * 90) + 10) * 100000000; // 1M - 9M
    const pagu = hps * (1 + rand() * 0.15); // 0-15% lebih tinggi
    
    const instansi = level === 'K/L' 
      ? instansiKL[Math.floor(rand() * instansiKL.length)]
      : `${instansiProv[Math.floor(rand() * instansiProv.length)]} Prov. ${province}`;
      
    // followed logic from earlier
    const followed = status !== 'Tidak Relevan' && rand() > 0.5;
    
    const changes = {};
    if (currentStage > 1 && rand() > 0.6) {
      const changeStage = Math.floor(rand() * currentStage) + 1;
      changes[changeStage] = Math.floor(rand() * 3) + 1;
    }

    const monthOffset = Math.floor(rand() * 2); // 0-1 bulan yang lalu
    const dayOffset = Math.floor(rand() * 28) + 1;
    const tglPengumuman = new Date(2026, 3 - monthOffset, dayOffset).toISOString().split('T')[0];

    tenders.push({
      id,
      nama: `${template.prefix} ${subject} ${city}`,
      instansi,
      level,
      lpse: level === 'K/L' ? `https://spse.inaproc.id/${instansi.toLowerCase().replace(/\s+/g, '')}` : `https://spse.inaproc.id/${province.toLowerCase().replace(/\s+/g, '')}prov`,
      hps: Math.round(hps),
      pagu: Math.round(pagu),
      metode,
      currentStage,
      provinsi: province,
      portofolio: template.portfolio,
      internalStatus: status,
      followed,
      won,
      changes,
      nama_satker: level === 'K/L' ? 'Direktorat Perencanaan dan Pengembangan' : 'Bidang Perencanaan Teknis',
      jenis_pengadaan: template.jenis,
      jenis_klpd: level === 'K/L' ? 'KEMENTERIAN' : level === 'Provinsi' ? 'PEMERINTAH PROVINSI' : 'PEMERINTAH KAB/KOTA',
      mtd_pemilihan: template.jenis.includes('Konsultansi') ? 'Seleksi' : 'Tender',
      mtd_evaluasi: rand() > 0.5 ? 'Kualitas dan Biaya' : 'Pagu Anggaran',
      mtd_kualifikasi: metode === 'Prakualifikasi' ? 'Pra Kualifikasi Dua File' : 'Pasca Kualifikasi Satu File',
      kualifikasi_paket: hps > 5000000000 ? 'Besar' : 'Non Kecil',
      sumber_dana: level === 'K/L' ? 'APBN' : 'APBD',
      kontrak_pembayaran: rand() > 0.5 ? 'Lumsum' : 'Harga Satuan',
      kd_tender: 100000 + id * 1000 + Math.floor(rand() * 999),
      kd_rup: `${20000000 + id * 10000 + Math.floor(rand() * 9999)}`,
      tahun_anggaran: 2026,
      tgl_pengumuman: tglPengumuman,
      lokasi_pekerjaan: `${city} - ${province}`,
      nama_ppk: namaPPK[Math.floor(rand() * namaPPK.length)],
      nama_pokja: namaPokja[Math.floor(rand() * namaPokja.length)],
    });
  }
  return tenders;
};

// Combine original tenders with generated ones
const allTendersRaw = [
  ...FALLBACK_TENDERS_RAW,
  ...generateAdditionalTenders(13, 88) // Generate 88 more tenders (13-100)
];

// Apply ensureStageDeadlines to all tenders
export const FALLBACK_TENDERS = allTendersRaw.map(ensureStageDeadlines);

export const FALLBACK_EXPERTS = [
  {
    id: 1,
    nama: 'Ir. Bambang Sutrisno, M.T.',
    noHp: '0812-3456-7890',
    instansi: 'Institut Teknologi Bandung',
    keahlian: ['Survei Topografi', 'GIS & Pemetaan', 'Geodesi'],
    availability: 'Tersedia',
    rating: 4.8,
    proyek: 23,
    portofolio: ['SDA'],
    history: [{ proyek: 'Survei Topografi Jalur Pipa Gas Trans-Kalimantan', klien: 'Pertamina Gas', tahun: 2024, nilai: 3200000000, peran: 'Team Leader', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [{ reviewer: 'PMO LSI', rating: 5, komentar: 'Data lapangan rapi dan cepat dikonsolidasikan.', tanggal: '12/03/2026' }],
  },
  {
    id: 2,
    nama: 'Dr. Siti Rahayu, S.E., M.M.',
    noHp: '0856-7890-1234',
    instansi: 'Universitas Indonesia',
    keahlian: ['Konsultan Investasi', 'Feasibility Study', 'Analisis Finansial'],
    availability: 'Sedang Bertugas',
    rating: 4.6,
    proyek: 17,
    portofolio: ['FITI'],
    history: [{ proyek: 'Masterplan KEK Pariwisata Timur Indonesia', klien: 'BKPM', tahun: 2025, nilai: 4600000000, peran: 'Investment Lead', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [{ reviewer: 'Direktorat FITI', rating: 5, komentar: 'Kuat di narasi investasi dan model kelayakan.', tanggal: '20/02/2026' }],
  },
  {
    id: 3,
    nama: 'Dra. Lestari Wulandari, M.Kes.',
    noHp: '0813-4567-8901',
    instansi: 'Universitas Gadjah Mada',
    keahlian: ['Survei Gizi', 'Instrumen Survei', 'Kajian Kebijakan Kesehatan'],
    availability: 'Tersedia',
    rating: 4.7,
    proyek: 14,
    portofolio: ['FLP'],
    history: [{ proyek: 'Survei Status Gizi Balita Wilayah Timur', klien: 'Kementerian Kesehatan', tahun: 2025, nilai: 2100000000, peran: 'Survey Methodologist', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 4,
    nama: 'Ir. Rudi Hartono, M.Sc.',
    noHp: '0812-2221-3344',
    instansi: 'Universitas Diponegoro',
    keahlian: ['Hidrologi', 'DED Drainase', 'Mitigasi Banjir'],
    availability: 'Tersedia',
    rating: 4.5,
    proyek: 19,
    portofolio: ['SDA'],
    history: [{ proyek: 'DED Drainase Kawasan Industri Kendal', klien: 'Pemprov Jawa Tengah', tahun: 2025, nilai: 2900000000, peran: 'Ahli Hidrologi', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [{ reviewer: 'PM SDA', rating: 4, komentar: 'Responsif untuk review teknis dan validasi model.', tanggal: '03/04/2026' }],
  },
  {
    id: 5,
    nama: 'Dr. Andini Prameswari, S.T., M.T.',
    noHp: '0817-9000-2211',
    instansi: 'Institut Teknologi Sepuluh Nopember',
    keahlian: ['Transportasi', 'Studi Kelayakan Bandara', 'Analisis Demand'],
    availability: 'Tersedia',
    rating: 4.7,
    proyek: 21,
    portofolio: ['FLP', 'FITI'],
    history: [{ proyek: 'Studi Bandara Perintis Papua', klien: 'Kementerian Perhubungan', tahun: 2024, nilai: 1800000000, peran: 'Ahli Transportasi', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 6,
    nama: 'Prof. Hendra Wijaya, Ph.D.',
    noHp: '0821-4455-6677',
    instansi: 'Universitas Padjadjaran',
    keahlian: ['Kebijakan Publik', 'Survei Kepuasan Masyarakat', 'Evaluasi Layanan'],
    availability: 'Sedang Bertugas',
    rating: 4.9,
    proyek: 31,
    portofolio: ['FLP'],
    history: [{ proyek: 'Evaluasi Pelayanan Perizinan Terpadu DKI', klien: 'DPMPTSP DKI Jakarta', tahun: 2025, nilai: 1350000000, peran: 'Policy Lead', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [{ reviewer: 'Direktorat FLP', rating: 5, komentar: 'Kuat untuk desain kuesioner dan rekomendasi kebijakan.', tanggal: '18/03/2026' }],
  },
  {
    id: 7,
    nama: 'Ir. Maya Laksmi, M.URP.',
    noHp: '0852-1100-7788',
    instansi: 'Praktisi Perencanaan Wilayah',
    keahlian: ['Masterplan Kawasan', 'Tata Ruang', 'Kawasan Industri'],
    availability: 'Tersedia',
    rating: 4.6,
    proyek: 16,
    portofolio: ['FITI'],
    history: [{ proyek: 'Masterplan Kawasan Industri Hijau Kaltara', klien: 'DPMPTSP Kaltara', tahun: 2025, nilai: 3900000000, peran: 'Urban Planner', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 8,
    nama: 'Dr. Yusuf Anwar, S.Si., M.Si.',
    noHp: '0819-3333-9090',
    instansi: 'Badan Riset dan Inovasi Nasional',
    keahlian: ['GIS', 'Remote Sensing', 'Inventarisasi Aset'],
    availability: 'Tidak Tersedia',
    rating: 4.4,
    proyek: 12,
    portofolio: ['SDA'],
    history: [{ proyek: 'Inventarisasi ROW SUTT Banten', klien: 'PLN UIP JBB', tahun: 2024, nilai: 2500000000, peran: 'Ahli GIS', bersama: 'Lain', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 9,
    nama: 'Agus Purnomo, S.T., M.T.',
    noHp: '0811-2233-4455',
    instansi: 'PT Surveyor Indonesia',
    keahlian: ['Pengadaan Tanah', 'ROW SUTT', 'Inventarisasi Aset'],
    availability: 'Tersedia',
    rating: 4.5,
    proyek: 31,
    portofolio: ['SDA'],
    history: [{ proyek: 'Inventarisasi ROW SUTT Jawa Barat', klien: 'Kementerian PUPR', tahun: 2024, nilai: 2800000000, peran: 'Koordinator Lapangan', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 10,
    nama: 'Dr. Andi Setiawan, M.Sc.',
    noHp: '0812-9012-3456',
    instansi: 'Universitas Hasanuddin',
    keahlian: ['Roadmap Investasi', 'IPRO', 'Hilirisasi Industri'],
    availability: 'Sedang Bertugas',
    rating: 4.9,
    proyek: 11,
    portofolio: ['FITI'],
    history: [{ proyek: 'IPRO Hilirisasi Mineral Sulawesi', klien: 'Kementerian ESDM', tahun: 2025, nilai: 5200000000, peran: 'Principal Consultant', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [{ reviewer: 'Kepala Proyek FITI', rating: 5, komentar: 'Sangat solid untuk executive presentation dan pemodelan ekonomi.', tanggal: '04/04/2026' }],
  },
  {
    id: 11,
    nama: 'Ir. Dewi Fitriani, M.T.',
    noHp: '0811-3456-7890',
    instansi: 'PT Rekayasa Industri',
    keahlian: ['PMC City Gas', 'Oversight Services', 'Manajemen Proyek'],
    availability: 'Tersedia',
    rating: 4.4,
    proyek: 26,
    portofolio: ['FLP'],
    history: [{ proyek: 'PMC Jargas Kota Semarang', klien: 'Kementerian ESDM', tahun: 2025, nilai: 1700000000, peran: 'Project Control', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 12,
    nama: 'Maya Putri, S.Kom., M.T.I.',
    noHp: '0856-1234-5678',
    instansi: 'PT Indosat Tbk',
    keahlian: ['Data Platform', 'Dashboard Intelligence', 'Survey Digital'],
    availability: 'Tersedia',
    rating: 4.6,
    proyek: 12,
    portofolio: ['FLP', 'FITI'],
    history: [{ proyek: 'Dashboard Monitoring Survei Nasional', klien: 'Badan Pangan Nasional', tahun: 2025, nilai: 980000000, peran: 'Data Lead', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 13,
    nama: 'Ir. Budi Santoso, M.T.',
    noHp: '0813-5555-6666',
    instansi: 'Universitas Brawijaya',
    keahlian: ['Struktur Bangunan', 'DED Infrastruktur', 'Analisis Struktur'],
    availability: 'Tersedia',
    rating: 4.7,
    proyek: 28,
    portofolio: ['SDA'],
    history: [{ proyek: 'DED Jembatan Tol Surabaya-Mojokerto', klien: 'Kementerian PUPR', tahun: 2024, nilai: 4500000000, peran: 'Structural Engineer', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [{ reviewer: 'PM Infrastruktur', rating: 5, komentar: 'Perhitungan struktur sangat detail dan akurat.', tanggal: '15/02/2026' }],
  },
  {
    id: 14,
    nama: 'Dr. Ratna Sari, S.E., M.M.',
    noHp: '0821-7777-8888',
    instansi: 'Universitas Airlangga',
    keahlian: ['Analisis Ekonomi', 'Studi Kelayakan Bisnis', 'Financial Modeling'],
    availability: 'Tersedia',
    rating: 4.8,
    proyek: 15,
    portofolio: ['FITI', 'FLP'],
    history: [{ proyek: 'Studi Kelayakan Kawasan Industri Gresik', klien: 'Pemkab Gresik', tahun: 2025, nilai: 3200000000, peran: 'Financial Analyst', bersama: 'Sucofindo', status: 'Selesai' }],
    reviews: [],
  },
  {
    id: 15,
    nama: 'Ir. Fajar Nugroho, M.Eng.',
    noHp: '0812-9999-0000',
    instansi: 'Institut Teknologi Bandung',
    keahlian: ['Geoteknik', 'Soil Investigation', 'Foundation Design'],
    availability: 'Sedang Bertugas',
    rating: 4.6,
    proyek: 22,
    portofolio: ['SDA'],
    history: [{ proyek: 'Soil Investigation Proyek PLTU Jawa Tengah', klien: 'PLN', tahun: 2024, nilai: 2100000000, peran: 'Geotechnical Engineer', bersama: 'Lain', status: 'Selesai' }],
    reviews: [{ reviewer: 'Project Manager PLN', rating: 4, komentar: 'Analisis tanah komprehensif dan tepat waktu.', tanggal: '28/01/2026' }],
  },
  {
    id: 16,
    nama: 'Arvian Riatmaja, S.T., M.Cs.',
    noHp: '0812-3456-7890',
    instansi: 'Universitas Gadjah Mada',
    keahlian: ['Full Stack Development', 'AI System Architect', 'Geospatial Data'],
    availability: 'Tersedia',
    rating: 5.0,
    proyek: 42,
    portofolio: ['FLP', 'FITI'],
    history: [{ proyek: 'SBU LSI Procurement Intelligence Platform', klien: 'Sucofindo', tahun: 2026, nilai: 1500000000, peran: 'Lead Developer', bersama: 'Sucofindo', status: 'Aktif' }],
    reviews: [{ reviewer: 'Direktur LSI', rating: 5, komentar: 'Sangat inovatif dalam mengintegrasikan AI ke dalam alur pengadaan.', tanggal: '03/05/2026' }],
  },
];
