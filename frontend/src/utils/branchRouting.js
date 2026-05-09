// Province / city / instansi -> branch routing.
// Mirror of backend/app/core/branch_routing.py.
//
// Resolution order:
//   1. K/L (Kementerian / Lembaga) -> SBU LSI Pusat.
//   2. Lokasi (city/kabupaten) match in CITY_TO_BRANCH (granular).
//   3. Province match in PROVINCE_TO_BRANCH (fallback).

import { getRegion } from './unitKerja.js';

export const PUSAT = 'SBU LSI';

// City / kabupaten -> nearest cabang. Used for granular routing within a province
// (e.g. Cilacap cabang gets Banyumas tenders, not Semarang cabang).
//
// Keys are normalized lowercase substrings. branchFor() does fuzzy contains-match.
export const CITY_TO_BRANCH = {
  // Sumatera
  'medan': 'Medan', 'binjai': 'Medan', 'pematang siantar': 'Medan', 'tebing tinggi': 'Medan',
  'padang': 'Padang', 'bukittinggi': 'Padang', 'payakumbuh': 'Padang', 'solok': 'Padang',
  'pekanbaru': 'Pekanbaru', 'kampar': 'Pekanbaru', 'siak': 'Pekanbaru', 'rokan': 'Pekanbaru',
  'dumai': 'Dumai', 'bengkalis': 'Dumai',
  'batam': 'Batam', 'tanjung pinang': 'Batam', 'bintan': 'Batam', 'karimun': 'Batam',
  'jambi': 'Jambi', 'kerinci': 'Jambi', 'muaro jambi': 'Jambi',
  'palembang': 'Palembang', 'lubuk linggau': 'Palembang', 'prabumulih': 'Palembang',
  'pangkal pinang': 'Palembang', 'belitung': 'Palembang',
  'bengkulu': 'Bengkulu', 'mukomuko': 'Bengkulu',
  'bandar lampung': 'Bandar Lampung', 'metro': 'Bandar Lampung', 'lampung selatan': 'Bandar Lampung', 'lampung': 'Bandar Lampung',
  // Jawa
  'jakarta pusat': 'Jakarta', 'jakarta selatan': 'Jakarta', 'jakarta barat': 'Jakarta',
  'jakarta timur': 'Jakarta', 'jakarta utara': 'Jakarta', 'jakarta': 'Jakarta', 'depok': 'Jakarta',
  'bekasi': 'Bekasi', 'karawang': 'Bekasi', 'cikarang': 'Bekasi',
  'bandung': 'Bandung', 'bogor': 'Bandung', 'sukabumi': 'Bandung', 'tasikmalaya': 'Bandung',
  'cirebon': 'Cirebon', 'indramayu': 'Cirebon', 'kuningan': 'Cirebon', 'majalengka': 'Cirebon',
  'cilegon': 'Cilegon', 'serang': 'Cilegon', 'tangerang': 'Cilegon', 'pandeglang': 'Cilegon', 'lebak': 'Cilegon',
  'cilacap': 'Cilacap', 'banyumas': 'Cilacap', 'purwokerto': 'Cilacap', 'kebumen': 'Cilacap', 'purworejo': 'Cilacap',
  'semarang': 'Semarang', 'kendal': 'Semarang', 'magelang': 'Semarang', 'salatiga': 'Semarang',
  'pekalongan': 'Semarang', 'solo': 'Semarang', 'surakarta': 'Semarang', 'pati': 'Semarang', 'kudus': 'Semarang',
  'yogyakarta': 'Semarang', 'sleman': 'Semarang', 'bantul': 'Semarang',
  'surabaya': 'Surabaya', 'sidoarjo': 'Surabaya', 'gresik': 'Surabaya', 'mojokerto': 'Surabaya',
  'jember': 'Surabaya', 'malang': 'Surabaya', 'madiun': 'Surabaya', 'kediri': 'Surabaya', 'banyuwangi': 'Surabaya',
  // Bali / NT
  'denpasar': 'Denpasar', 'badung': 'Denpasar', 'gianyar': 'Denpasar', 'tabanan': 'Denpasar',
  'mataram': 'Denpasar', 'lombok': 'Denpasar', 'sumbawa': 'Denpasar',
  'kupang': 'Denpasar', 'ende': 'Denpasar', 'maumere': 'Denpasar',
  // Kalimantan
  'pontianak': 'Pontianak', 'singkawang': 'Pontianak', 'sintang': 'Pontianak', 'ketapang': 'Pontianak',
  'palangka raya': 'Banjarmasin', 'sampit': 'Banjarmasin', 'kapuas': 'Banjarmasin',
  'banjarmasin': 'Banjarmasin', 'banjarbaru': 'Banjarmasin', 'martapura': 'Banjarmasin',
  'batulicin': 'Batulicin', 'tanah bumbu': 'Batulicin', 'kotabaru': 'Batulicin',
  'balikpapan': 'Balikpapan', 'penajam': 'Balikpapan',
  'samarinda': 'Samarinda', 'kutai': 'Samarinda', 'tenggarong': 'Samarinda',
  'bontang': 'Bontang',
  'sangatta': 'Sangatta', 'kutai timur': 'Sangatta',
  'tarakan': 'Tarakan', 'nunukan': 'Tarakan', 'malinau': 'Tarakan', 'bulungan': 'Tarakan',
  // Sulawesi
  'makassar': 'Makassar', 'parepare': 'Makassar', 'palopo': 'Makassar', 'maros': 'Makassar', 'gowa': 'Makassar',
  'manado': 'Makassar', 'bitung': 'Makassar', 'tomohon': 'Makassar', 'minahasa': 'Makassar',
  'palu': 'Makassar', 'poso': 'Makassar', 'donggala': 'Makassar', 'sigi': 'Makassar',
  'gorontalo': 'Makassar',
  'mamuju': 'Makassar', 'majene': 'Makassar',
  'kendari': 'Kendari', 'bau-bau': 'Kendari', 'baubau': 'Kendari', 'konawe': 'Kendari',
  // Maluku / Papua
  'ambon': 'Makassar', 'tual': 'Makassar', 'maluku tengah': 'Makassar',
  'ternate': 'Makassar', 'tidore': 'Makassar', 'halmahera': 'Makassar',
  'jayapura': 'Timika', 'merauke': 'Timika', 'biak': 'Timika',
  'manokwari': 'Timika', 'sorong': 'Timika', 'fakfak': 'Timika',
  'timika': 'Timika', 'mimika': 'Timika', 'nabire': 'Timika', 'wamena': 'Timika',
};

export const PROVINCE_TO_BRANCH = {
  // Sumatera (Wilayah Barat)
  'Aceh': 'Medan',
  'Sumatera Utara': 'Medan',
  'Sumatera Barat': 'Padang',
  'Riau': 'Pekanbaru',
  'Kepulauan Riau': 'Batam',
  'Jambi': 'Jambi',
  'Sumatera Selatan': 'Palembang',
  'Kepulauan Bangka Belitung': 'Palembang',
  'Bengkulu': 'Bengkulu',
  'Lampung': 'Bandar Lampung',
  // Jawa
  'DKI Jakarta': 'Jakarta',
  'Banten': 'Cilegon',
  'Jawa Barat': 'Bandung',
  'Jawa Tengah': 'Semarang',
  'DI Yogyakarta': 'Semarang',
  'Jawa Timur': 'Surabaya',
  // Bali / NT (Wilayah Timur)
  'Bali': 'Denpasar',
  'NTB': 'Denpasar',
  'NTT': 'Denpasar',
  // Kalimantan (Timur)
  'Kalimantan Barat': 'Pontianak',
  'Kalimantan Tengah': 'Banjarmasin',
  'Kalimantan Selatan': 'Banjarmasin',
  'Kalimantan Timur': 'Balikpapan',
  'Kalimantan Utara': 'Tarakan',
  // Sulawesi (Timur)
  'Sulawesi Utara': 'Makassar',
  'Gorontalo': 'Makassar',
  'Sulawesi Tengah': 'Makassar',
  'Sulawesi Barat': 'Makassar',
  'Sulawesi Selatan': 'Makassar',
  'Sulawesi Tenggara': 'Kendari',
  // Maluku / Papua (Timur)
  'Maluku': 'Makassar',
  'Maluku Utara': 'Makassar',
  'Papua': 'Timika',
  'Papua Barat': 'Timika',
  'Papua Barat Daya': 'Timika',
  'Papua Tengah': 'Timika',
  'Papua Pegunungan': 'Timika',
  'Papua Selatan': 'Timika',
};

export function isKlInstansi(instansi = '', jenisKlpd = '', level = '') {
  if (level === 'K/L') return true;
  if (jenisKlpd === 'KEMENTERIAN' || jenisKlpd === 'LEMBAGA') return true;
  const s = (instansi || '').toLowerCase();
  if (!s) return false;
  if (/(kementerian|kemen[\.\s]|badan |bappenas|bapenas)/.test(s)) return true;
  if (/(\bpln\b|pertamina|telkom|bumn)/.test(s)) return true;
  return false;
}

// Returns { unit_kerja, unit_kerja_region } or null when no route.
//
// `lokasi` is optional — pass tender.lokasi_pekerjaan or kabupaten/city.
// City-match wins over province-fallback so e.g. tender di Cilacap goes to
// Cabang Cilacap, not Semarang.
export function branchFor({ provinsi, instansi, jenis_klpd, level, lokasi, kabupaten } = {}) {
  if (isKlInstansi(instansi || '', jenis_klpd || '', level || '')) {
    return { unit_kerja: PUSAT, unit_kerja_region: getRegion(PUSAT) };
  }

  // Try city / kabupaten match first.
  const cityHaystack = `${lokasi || ''} ${kabupaten || ''} ${instansi || ''}`.toLowerCase();
  for (const [needle, branch] of Object.entries(CITY_TO_BRANCH)) {
    if (cityHaystack.includes(needle)) {
      return { unit_kerja: branch, unit_kerja_region: getRegion(branch) };
    }
  }

  if (provinsi && PROVINCE_TO_BRANCH[provinsi]) {
    const unit = PROVINCE_TO_BRANCH[provinsi];
    return { unit_kerja: unit, unit_kerja_region: getRegion(unit) };
  }
  return null;
}
