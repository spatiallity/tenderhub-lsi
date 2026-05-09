// TenderHub LSIv2 - Deployment Version: 2026-05-03 19:19
import { subDays, subMonths, format } from 'date-fns';

// Helper function to generate stage deadlines based on current stage
// LOGIC: Current stage END DATE determines the deadline badge
const generateStageDeadlines = (metode, currentStage, daysUntilDeadline = null) => {
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
  // Deterministic based on currentStage to ensure consistency
  if (daysUntilDeadline === null) {
    daysUntilDeadline = ((currentStage * 7 + 3) % 15); // 0 to 14 days, deterministic
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
  if (!tender.stageDeadlines && tender.metode && tender.currentStage) {
    // Use tender.daysUntilDeadline if specified, otherwise random
    const daysUntil = tender.daysUntilDeadline !== undefined ? tender.daysUntilDeadline : null;
    return {
      ...tender,
      stageDeadlines: generateStageDeadlines(tender.metode, tender.currentStage, daysUntil)
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
    nama: 'Inventarisasi Aset dan Pemetaan ROW Jaringan Distribusi Banten',
    instansi: 'Dinas ESDM Provinsi Banten',
    level: 'Provinsi',
    lpse: 'https://lpse.bantenprov.go.id',
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
    nama_satker: 'Bidang Energi dan Ketenagalistrikan',
    jenis_pengadaan: 'Jasa Konsultansi Badan Usaha',
    jenis_klpd: 'PEMERINTAH PROVINSI',
    mtd_pemilihan: 'Tender',
    mtd_evaluasi: 'Harga Terendah Sistem Gugur',
    mtd_kualifikasi: 'Pasca Kualifikasi Satu File',
    kualifikasi_paket: 'Non Kecil',
    sumber_dana: 'APBD',
    kontrak_pembayaran: 'Harga Satuan',
    kd_tender: 731251,
    kd_rup: '60125010',
    tahun_anggaran: 2026,
    tgl_pengumuman: '2026-04-05',
    lokasi_pekerjaan: 'Serang - Banten',
    nama_ppk: 'Raka Pradipta, S.T.',
    nama_pokja: 'Pokja Pemilihan 02',
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

// Domain buckets — each pairs one or more instansi with realistic package names
// so generator never produces "Kementerian Pendidikan: Survei Bandara".
//
// Each bucket: { kl, prov, packages: [{name, jenis, portfolio}] }
//   kl   = Kementerian/Lembaga names
//   prov = Dinas/Pemda names (city/province appended at runtime)
const DOMAIN_BUCKETS = [
  // Infrastruktur jalan & transportasi
  {
    kl: ['Kementerian PUPR', 'Kementerian Perhubungan'],
    prov: ['Dinas PUPR', 'Dinas Perhubungan', 'Dinas Bina Marga'],
    packages: [
      { name: 'Pengawasan Pembangunan Jalan Nasional', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'DED Jembatan dan Jalan Lingkar', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Studi Kelayakan Pengembangan Pelabuhan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Kajian Sistem Transportasi Massal', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FLP' },
      { name: 'Survei Topografi Trase Jalan Tol', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Pengawasan Konstruksi Jembatan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    ],
  },
  // Sumber daya air & lingkungan
  {
    kl: ['Kementerian PUPR', 'Kementerian LHK'],
    prov: ['Dinas PUPR', 'Dinas Lingkungan Hidup', 'Dinas Sumber Daya Air'],
    packages: [
      { name: 'Pengawasan Pembangunan Bendungan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'DED Sistem Irigasi Teknis', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Rehabilitasi DAS dan Monitoring Vegetasi', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Studi Pengelolaan Sumber Daya Air Terpadu', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Kajian Lingkungan Hidup Strategis Kawasan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FLP' },
      { name: 'Inventarisasi Aset Jaringan Irigasi', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    ],
  },
  // Energi & ketenagalistrikan
  {
    kl: ['Kementerian ESDM'],
    prov: ['Dinas ESDM'],
    packages: [
      { name: 'Studi Kelayakan PLTS Komunal', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Pemetaan Potensi Energi Baru Terbarukan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'DED Jaringan Distribusi Listrik Pedesaan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Kajian Hilirisasi Mineral Strategis', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Inventarisasi Cadangan Migas Wilayah Kerja', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    ],
  },
  // Investasi & ekonomi kawasan
  {
    kl: ['Kementerian Investasi/BKPM', 'Bappenas'],
    prov: ['DPMPTSP', 'Bappeda'],
    packages: [
      { name: 'Penyusunan Investment Project Ready to Offer (IPRO)', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Peta Peluang Investasi Sektor Prioritas', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Roadmap Investasi Hilirisasi Industri', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Penyusunan Masterplan Kawasan Ekonomi Khusus', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Kajian Daya Saing Investasi Daerah', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
    ],
  },
  // Industri
  {
    kl: ['Kementerian Perindustrian'],
    prov: ['Dinas Perindustrian'],
    packages: [
      { name: 'DED Kawasan Industri Terpadu', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Studi Kelayakan Pengembangan Sentra IKM', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Survei Topografi Lahan Kawasan Industri', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Penyusunan Rencana Induk Industri Daerah', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
    ],
  },
  // Kesehatan
  {
    kl: ['Kementerian Kesehatan', 'Badan Pangan Nasional'],
    prov: ['Dinas Kesehatan'],
    packages: [
      { name: 'Survei Status Gizi Balita Wilayah', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Pendataan Sasaran Program Imunisasi Nasional', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Pemetaan Fasilitas Kesehatan Primer', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FLP' },
      { name: 'Kajian Implementasi Jaminan Kesehatan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FLP' },
      { name: 'Studi Kelayakan Pembangunan RSUD Tipe B', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Verifikasi Penerima Program Bantuan Gizi', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
    ],
  },
  // Pendidikan
  {
    kl: ['Kementerian Pendidikan'],
    prov: ['Dinas Pendidikan'],
    packages: [
      { name: 'Pendataan Sarana dan Prasarana Sekolah Dasar', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Survei Kompetensi Guru dan Tenaga Kependidikan', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Kajian Pengembangan SMK Vokasi Strategis', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FLP' },
      { name: 'Evaluasi Program Bantuan Operasional Sekolah', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Studi Kelayakan Pendirian Politeknik Daerah', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
    ],
  },
  // Pertanian
  {
    kl: ['Kementerian Pertanian'],
    prov: ['Dinas Pertanian'],
    packages: [
      { name: 'Pendataan Komoditas Pangan Strategis', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Survei Lahan Pertanian Berkelanjutan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Kajian Hilirisasi Komoditas Perkebunan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Pemetaan Kesesuaian Lahan Pertanian', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    ],
  },
  // Kelautan & perikanan
  {
    kl: ['Kementerian Kelautan dan Perikanan'],
    prov: ['Dinas Kelautan dan Perikanan'],
    packages: [
      { name: 'Survei Bathimetri dan Sumber Daya Pesisir', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
      { name: 'Pendataan Nelayan Tradisional', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Studi Kelayakan Pelabuhan Perikanan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Kajian Pengelolaan Wilayah Pesisir Terpadu', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'SDA' },
    ],
  },
  // Pariwisata
  {
    kl: ['Kementerian Pariwisata'],
    prov: ['Dinas Pariwisata'],
    packages: [
      { name: 'Penyusunan Masterplan Destinasi Pariwisata', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Studi Daya Tarik Wisata Berkelanjutan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
      { name: 'Survei Profil Wisatawan Nusantara', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Kajian Pengembangan Desa Wisata', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FITI' },
    ],
  },
  // Koperasi & UKM
  {
    kl: ['Kementerian Koperasi dan UKM'],
    prov: ['Dinas Koperasi dan UKM'],
    packages: [
      { name: 'Pendataan dan Profil Koperasi Aktif', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Survei Kebutuhan Pendampingan UMKM', jenis: 'Jasa Lainnya', portfolio: 'FLP' },
      { name: 'Kajian Penguatan Ekosistem UMKM Pangan', jenis: 'Jasa Konsultansi Badan Usaha', portfolio: 'FLP' },
    ],
  },
];

// Generator function to create additional dummy tenders.
const generateAdditionalTenders = (startId, count) => {
  // Province -> list of plausible kota/kabupaten (so location stays internally consistent).
  const CITY_BY_PROV = {
    'Jawa Barat': ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cirebon', 'Tasikmalaya'],
    'Jawa Tengah': ['Semarang', 'Solo', 'Magelang', 'Pekalongan', 'Kendal'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Gresik', 'Jember'],
    'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur'],
    'Banten': ['Tangerang', 'Serang', 'Cilegon'],
    'Sumatera Utara': ['Medan', 'Binjai', 'Pematang Siantar'],
    'Sumatera Barat': ['Padang', 'Bukittinggi', 'Payakumbuh'],
    'Sumatera Selatan': ['Palembang', 'Lubuk Linggau', 'Prabumulih'],
    'Riau': ['Pekanbaru', 'Dumai', 'Kampar'],
    'Lampung': ['Bandar Lampung', 'Metro', 'Lampung Selatan'],
    'Kalimantan Timur': ['Balikpapan', 'Samarinda', 'Bontang'],
    'Kalimantan Selatan': ['Banjarmasin', 'Banjarbaru', 'Tanah Bumbu'],
    'Kalimantan Barat': ['Pontianak', 'Singkawang', 'Sintang'],
    'Kalimantan Tengah': ['Palangka Raya', 'Sampit', 'Kapuas'],
    'Sulawesi Selatan': ['Makassar', 'Parepare', 'Palopo'],
    'Sulawesi Utara': ['Manado', 'Bitung', 'Tomohon'],
    'Sulawesi Tengah': ['Palu', 'Poso', 'Donggala'],
    'Sulawesi Tenggara': ['Kendari', 'Bau-Bau', 'Konawe'],
    'Bali': ['Denpasar', 'Badung', 'Gianyar'],
    'NTB': ['Mataram', 'Lombok Timur', 'Sumbawa'],
    'NTT': ['Kupang', 'Ende', 'Maumere'],
    'Papua': ['Jayapura', 'Merauke', 'Biak'],
    'Papua Barat': ['Manokwari', 'Sorong', 'Fakfak'],
    'Maluku': ['Ambon', 'Tual', 'Maluku Tengah'],
    'Maluku Utara': ['Ternate', 'Tidore', 'Halmahera Tengah'],
  };
  const provinces = Object.keys(CITY_BY_PROV);

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

  // Bias toward Dipantau so that "available" pool stays large after claim seed.
  // Distribution: ~70% Dipantau, ~10% Akan, ~10% Sudah, ~10% Tidak Relevan.
  const internalStatuses = [
    'Dipantau','Dipantau','Dipantau','Dipantau','Dipantau','Dipantau','Dipantau',
    'Akan Diikuti',
    'Sudah Diikuti',
    'Tidak Relevan',
  ];
  const metodes = ['Prakualifikasi', 'Pascakualifikasi'];
  const levels = ['K/L', 'Provinsi', 'Kab/Kota'];

  // Seeded PRNG for deterministic data generation
  let seed = 42;
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };

  const tenders = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const province = provinces[Math.floor(rand() * provinces.length)];
    const provinceCities = CITY_BY_PROV[province];
    const city = provinceCities[Math.floor(rand() * provinceCities.length)];
    const level = levels[Math.floor(rand() * levels.length)];
    const metode = metodes[Math.floor(rand() * metodes.length)];
    const maxStage = metode === 'Prakualifikasi' ? 21 : 12;

    // Pick a domain bucket and a package — guarantees nama_paket matches instansi.
    const bucket = DOMAIN_BUCKETS[Math.floor(rand() * DOMAIN_BUCKETS.length)];
    const pkg = bucket.packages[Math.floor(rand() * bucket.packages.length)];

    let currentStage = Math.floor(rand() * Math.min(10, maxStage)) + 1;
    let status = internalStatuses[Math.floor(rand() * internalStatuses.length)];
    let won = status === 'Sudah Diikuti' && rand() > 0.7;

    if (won) {
        currentStage = metode === 'Prakualifikasi' ? 20 : 11;
        status = 'Menang';
    }

    const hps = (Math.floor(rand() * 90) + 10) * 100000000;
    const pagu = hps * (1 + rand() * 0.15);

    let instansi;
    let jenisKlpd;
    let nama_satker;
    if (level === 'K/L') {
      instansi = bucket.kl[Math.floor(rand() * bucket.kl.length)];
      jenisKlpd = 'KEMENTERIAN';
      nama_satker = 'Direktorat Perencanaan dan Pengembangan';
    } else if (level === 'Provinsi') {
      instansi = `${bucket.prov[Math.floor(rand() * bucket.prov.length)]} Prov. ${province}`;
      jenisKlpd = 'PEMERINTAH PROVINSI';
      nama_satker = 'Bidang Perencanaan Teknis';
    } else {
      instansi = `${bucket.prov[Math.floor(rand() * bucket.prov.length)]} Kab. ${city}`;
      jenisKlpd = 'PEMERINTAH KAB/KOTA';
      nama_satker = 'Bidang Perencanaan Teknis';
    }

    const followed = status !== 'Tidak Relevan' && rand() > 0.5;

    const changes = {};
    if (currentStage > 1 && rand() > 0.6) {
      const changeStage = Math.floor(rand() * currentStage) + 1;
      changes[changeStage] = Math.floor(rand() * 3) + 1;
    }

    const monthOffset = Math.floor(rand() * 2);
    const dayOffset = Math.floor(rand() * 28) + 1;
    const tglPengumuman = new Date(2026, 3 - monthOffset, dayOffset).toISOString().split('T')[0];

    tenders.push({
      id,
      nama: `${pkg.name} di ${city}`,
      instansi,
      level,
      lpse: level === 'K/L'
        ? `https://spse.inaproc.id/${instansi.toLowerCase().replace(/\s+/g, '')}`
        : `https://spse.inaproc.id/${province.toLowerCase().replace(/\s+/g, '')}prov`,
      hps: Math.round(hps),
      pagu: Math.round(pagu),
      metode,
      currentStage,
      provinsi: province,
      portofolio: pkg.portfolio,
      internalStatus: status,
      followed,
      won,
      changes,
      nama_satker,
      jenis_pengadaan: pkg.jenis,
      jenis_klpd: jenisKlpd,
      mtd_pemilihan: pkg.jenis.includes('Konsultansi') ? 'Seleksi' : 'Tender',
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

// 13 hand-curated + 137 generated = 150 total. Distribution ~100 available
// (Dipantau) once claim seed runs.
const allTendersRaw = [
  ...FALLBACK_TENDERS_RAW,
  ...generateAdditionalTenders(13, 137)
];

// Apply ensureStageDeadlines to all tenders
export const FALLBACK_TENDERS = allTendersRaw.map(ensureStageDeadlines);

// Augment a hand-curated expert with at least 10 dummy projects and 5 reviews
// so demo screens look populated. Existing entries stay as the 1st project/review.
const PROJECT_BANK = {
  SDA: [
    ['Survei Topografi Jalur Pipa', 'Pertamina Gas', 'Bandung, Jawa Barat'],
    ['Pengadaan Tanah Tol Trans-Jawa', 'Kementerian PUPR', 'Semarang, Jawa Tengah'],
    ['Inventarisasi ROW SUTT 150 kV', 'PLN UIP', 'Serang, Banten'],
    ['DED Drainase Kawasan Industri', 'Pemprov Jawa Tengah', 'Kendal, Jawa Tengah'],
    ['Pemetaan Risiko Banjir', 'Dinas SDA Jabar', 'Cirebon, Jawa Barat'],
    ['Survei GIS Kawasan Tambang', 'Kementerian ESDM', 'Samarinda, Kalimantan Timur'],
    ['Pengukuran Kadaster Tol', 'BPN Pusat', 'Bekasi, Jawa Barat'],
    ['Studi Geoteknik Pelabuhan', 'Kementerian Perhubungan', 'Surabaya, Jawa Timur'],
    ['Bush Clearing IKN', 'Otorita IKN', 'Penajam Paser Utara, Kalimantan Timur'],
    ['Rehabilitasi Daerah Irigasi', 'Kementerian PUPR', 'Subang, Jawa Barat'],
    ['Survei Hidrologi Bendungan', 'BBWS Citarum', 'Bandung, Jawa Barat'],
    ['DED Embung Multifungsi', 'Pemprov NTB', 'Lombok Timur, NTB'],
  ],
  FLP: [
    ['Survei Status Gizi Balita', 'Kementerian Kesehatan', 'Jakarta'],
    ['Pendataan UMKM Pangan', 'Kemenkop UKM', 'Surabaya, Jawa Timur'],
    ['Evaluasi Pelayanan Perizinan', 'DPMPTSP DKI', 'Jakarta'],
    ['PMC Jaringan Gas Kota', 'Kementerian ESDM', 'Semarang, Jawa Tengah'],
    ['Survei Kepuasan Masyarakat', 'Pemprov Jabar', 'Bandung, Jawa Barat'],
    ['Kajian Kebijakan Pendidikan', 'Kemendikbud', 'Yogyakarta, DIY'],
    ['Oversight Services Air Bersih', 'Kementerian PUPR', 'Padang, Sumatera Barat'],
    ['Survei Kepatuhan Pelayanan', 'Ombudsman RI', 'Makassar, Sulawesi Selatan'],
    ['Studi Bandara Perintis', 'Kementerian Perhubungan', 'Jayapura, Papua'],
    ['Pendampingan PNPM Mandiri', 'Kemendes PDTT', 'Kupang, NTT'],
    ['Instrumen Survei Layanan Publik', 'KemenPAN-RB', 'Jakarta'],
    ['Riset Persepsi Layanan Kesehatan', 'BPJS Kesehatan', 'Bandung, Jawa Barat'],
  ],
  FITI: [
    ['Masterplan KEK Pariwisata', 'BKPM', 'Mandalika, NTB'],
    ['IPRO Hilirisasi Mineral', 'Kementerian ESDM', 'Konawe, Sulawesi Tenggara'],
    ['Studi Kelayakan Kawasan Industri', 'Pemkab Gresik', 'Gresik, Jawa Timur'],
    ['Roadmap Investasi Pariwisata', 'BKPM', 'Manado, Sulawesi Utara'],
    ['Peta Peluang Investasi', 'BKPM', 'Sorong, Papua Barat'],
    ['Feasibility Study Pelabuhan', 'Kementerian Perhubungan', 'Bitung, Sulawesi Utara'],
    ['Masterplan Kawasan Industri Hijau', 'DPMPTSP Kaltara', 'Bulungan, Kalimantan Utara'],
    ['Studi Hilirisasi Rumput Laut', 'Pemprov NTB', 'Lombok Timur, NTB'],
    ['Investment Project Ready (IPRO)', 'BKPM', 'Surabaya, Jawa Timur'],
    ['Profil Investasi Energi Terbarukan', 'Kementerian ESDM', 'Bali'],
    ['Kajian Demand Bandara Internasional', 'AP II', 'Kertajati, Jawa Barat'],
    ['Studi Investasi Cold Storage', 'KKP', 'Ambon, Maluku'],
  ],
};

const REVIEW_BANK = [
  ['PMO LSI', 5, 'Komunikasi rapi, deliverable on-time, dan dokumentasi lengkap.'],
  ['PM SDA', 4, 'Kuat di analisis teknis, mau revisi cepat saat dibutuhkan.'],
  ['Direktorat FLP', 5, 'Sangat solid pada metodologi survei dan rekomendasi.'],
  ['Direktorat FITI', 5, 'Narasi investasi tajam dan model finansial dapat dipertanggungjawabkan.'],
  ['Procurement Officer', 4, 'Profesional, dokumen kualifikasi tertib, presentasi clear.'],
  ['Klien BUMN', 5, 'Tim koordinasi excellent, eskalasi cepat saat ada blocker.'],
  ['Reviewer Independen', 4, 'Kualitas laporan akhir di atas rata-rata, tinggal poles editing.'],
  ['Manajer Proyek', 5, 'Inisiatif tinggi dan handal mengelola anggota tim lapangan.'],
];

const TAHUN_OPTS = [2020, 2021, 2022, 2023, 2024, 2025];

const augmentExpert = (expert) => {
  // Pick portfolio bank — fall back to SDA when expert has no portofolio.
  const portKey = (expert.portofolio && expert.portofolio[0]) || 'SDA';
  const bank = PROJECT_BANK[portKey] || PROJECT_BANK.SDA;
  const baseHistory = expert.history || [];
  const baseReviews = expert.reviews || [];

  // Deterministic offset so each expert lands on a different slice of the bank.
  const off = (expert.id || 1) * 3;

  const padHistory = [];
  for (let i = baseHistory.length; i < 10; i++) {
    const [proyek, klien, lokasi] = bank[(off + i) % bank.length];
    const tahun = TAHUN_OPTS[(off + i) % TAHUN_OPTS.length];
    const nilai = (((off + i) % 9) + 1) * 500_000_000;
    padHistory.push({
      proyek,
      klien,
      tahun,
      nilai,
      peran: ['Team Leader', 'Tenaga Ahli Utama', 'Ahli Madya', 'Koordinator Lapangan'][(off + i) % 4],
      bersama: i % 3 === 0 ? 'Lain' : 'Sucofindo',
      status: 'Selesai',
      lokasi_proyek: lokasi,
    });
  }

  const padReviews = [];
  for (let i = baseReviews.length; i < 5; i++) {
    const [reviewer, rating, komentar] = REVIEW_BANK[(off + i) % REVIEW_BANK.length];
    const dt = new Date(2025, ((off + i) % 12), ((off + i) % 27) + 1);
    padReviews.push({
      reviewer,
      rating,
      komentar,
      tanggal: dt.toLocaleDateString('id-ID'),
    });
  }

  const finalReviews = [...baseReviews, ...padReviews];
  const avgRating = finalReviews.reduce((s, r) => s + (r.rating || 0), 0) / Math.max(1, finalReviews.length);

  return {
    ...expert,
    history: [...baseHistory, ...padHistory],
    reviews: finalReviews,
    proyek: Math.max(expert.proyek || 0, 10 + Math.floor((expert.id || 0) % 8)),
    rating: Number(avgRating.toFixed(1)),
  };
};

const _RAW_FALLBACK_EXPERTS = [
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
    noHp: '0857-1234-9876',
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

export const FALLBACK_EXPERTS = _RAW_FALLBACK_EXPERTS.map(augmentExpert);
