// Unit kerja (cabang + pusat) — single source of truth, mirrors backend/app/core/unit_kerja.py.
// Used by user forms, claim badges, StatusPage filters.

export const UNIT_KERJA = [
  // Wilayah Barat
  { name: 'Bandar Lampung', region: 'Barat' },
  { name: 'Bandung',        region: 'Barat' },
  { name: 'Batam',          region: 'Barat' },
  { name: 'Bekasi',         region: 'Barat' },
  { name: 'Bengkulu',       region: 'Barat' },
  { name: 'Cilacap',        region: 'Barat' },
  { name: 'Cilegon',        region: 'Barat' },
  { name: 'Cirebon',        region: 'Barat' },
  { name: 'Dumai',          region: 'Barat' },
  { name: 'Jakarta',        region: 'Barat' },
  { name: 'Jambi',          region: 'Barat' },
  { name: 'Medan',          region: 'Barat' },
  { name: 'Padang',         region: 'Barat' },
  { name: 'Palembang',      region: 'Barat' },
  { name: 'Pekanbaru',      region: 'Barat' },
  { name: 'Semarang',       region: 'Barat' },
  // Wilayah Timur
  { name: 'Balikpapan',  region: 'Timur' },
  { name: 'Banjarmasin', region: 'Timur' },
  { name: 'Batulicin',   region: 'Timur' },
  { name: 'Bontang',     region: 'Timur' },
  { name: 'Denpasar',    region: 'Timur' },
  { name: 'Kendari',     region: 'Timur' },
  { name: 'Makassar',    region: 'Timur' },
  { name: 'Pontianak',   region: 'Timur' },
  { name: 'Samarinda',   region: 'Timur' },
  { name: 'Sangatta',    region: 'Timur' },
  { name: 'Surabaya',    region: 'Timur' },
  { name: 'Tarakan',     region: 'Timur' },
  { name: 'Timika',      region: 'Timur' },
  // Pusat
  { name: 'SBU LSI', region: 'Pusat' },
];

export const REGIONS = ['Barat', 'Timur', 'Pusat'];

const NAME_TO_REGION = Object.fromEntries(UNIT_KERJA.map(u => [u.name, u.region]));

export const getRegion = (unitName) => NAME_TO_REGION[unitName] || null;

export const isPusat = (unitName) => unitName === 'SBU LSI';

// Group helper for grouped <select> dropdowns.
export const UNIT_KERJA_BY_REGION = REGIONS.reduce((acc, region) => {
  acc[region] = UNIT_KERJA.filter(u => u.region === region).map(u => u.name);
  return acc;
}, {});

// Display label: "SBU LSI Pusat" vs "Cabang Bandung".
export const unitKerjaLabel = (unitName) => {
  if (!unitName) return '';
  if (isPusat(unitName)) return 'SBU LSI Pusat';
  return `Cabang ${unitName}`;
};

// Role helpers.
export const ROLES = ['admin', 'pusat', 'cabang', 'manager', 'user', 'guest'];

// Map a profile to "owner identity" for claim comparison.
export const claimMatches = (profile, claimUnitKerja) => {
  if (!profile || !claimUnitKerja) return false;
  if (profile.role === 'admin') return true;
  return profile.unit_kerja === claimUnitKerja;
};
