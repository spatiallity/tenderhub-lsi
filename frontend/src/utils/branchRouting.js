// Province / instansi -> branch routing. Mirror of backend/app/core/branch_routing.py.
// K/L (Kementerian / Lembaga / BUMN pusat) -> SBU LSI Pusat.
// Pemprov / Pemkab / Pemkot -> nearest cabang via PROVINCE_TO_BRANCH.

import { getRegion } from './unitKerja.js';

export const PUSAT = 'SBU LSI';

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
export function branchFor({ provinsi, instansi, jenis_klpd, level } = {}) {
  let unit;
  if (isKlInstansi(instansi || '', jenis_klpd || '', level || '')) {
    unit = PUSAT;
  } else if (provinsi && PROVINCE_TO_BRANCH[provinsi]) {
    unit = PROVINCE_TO_BRANCH[provinsi];
  } else {
    return null;
  }
  return { unit_kerja: unit, unit_kerja_region: getRegion(unit) };
}
