// One-shot dummy claim seeder. Triggered from Settings > "Seed Dummy Claims" button.
// Walks FALLBACK_TENDERS / FALLBACK_RUP, applies geographic rule, upserts to Supabase.
//
// Rules:
//  - Tenders with internalStatus in {Akan Diikuti, Sudah Diikuti, Menang, Kalah}
//    MUST be claimed.
//  - K/L -> SBU LSI Pusat. Else -> nearest cabang (PROVINCE_TO_BRANCH).
//  - Tenders Dipantau / Tidak Relevan stay UNCLAIMED.
//  - For RUP, ~50% randomly claimed via same geographic rule.

import supabase from '../services/supabase';
import { branchFor, PUSAT } from './branchRouting';
import { getRegion } from './unitKerja';
import { FALLBACK_TENDERS } from '../data/demoData';
import { FALLBACK_RUP } from '../data/rupDummy';

const ACTIVE_STATUSES = new Set(['Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah']);

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export async function seedTenderClaims(onProgress = () => {}) {
  let claimed = 0, skipped = 0, errors = 0;
  const nowIso = new Date().toISOString();
  const total = FALLBACK_TENDERS.length;

  for (let i = 0; i < FALLBACK_TENDERS.length; i++) {
    const t = FALLBACK_TENDERS[i];
    const status = t.internalStatus || 'Dipantau';
    if (!ACTIVE_STATUSES.has(status)) { skipped++; continue; }

    const route = branchFor({
      provinsi: t.provinsi,
      instansi: t.instansi,
      jenis_klpd: t.jenis_klpd,
      level: t.level,
    }) || { unit_kerja: PUSAT, unit_kerja_region: getRegion(PUSAT) };

    const kdTender = parseInt(t.kd_tender || t.id);
    if (!kdTender) continue;

    try {
      const { error } = await supabase
        .from('tender_watchlist')
        .upsert({
          kd_tender: kdTender,
          nama_paket: t.nama,
          nama_klpd: t.instansi,
          hps: t.hps,
          status_internal: status,
          unit_kerja: route.unit_kerja,
          unit_kerja_region: route.unit_kerja_region,
          claimed_at: nowIso,
        }, { onConflict: 'kd_tender' });
      if (error) throw error;
      claimed++;
    } catch (e) {
      errors++;
      console.warn(`[seed tender ${kdTender}] ${e.message}`);
    }
    onProgress({ phase: 'tender', done: i + 1, total, claimed, skipped, errors });
  }
  return { claimed, skipped, errors };
}

export async function seedRupClaims(onProgress = () => {}) {
  let claimed = 0, errors = 0;
  const nowIso = new Date().toISOString();
  const rand = seededRand(42);
  const statuses = ['Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah'];
  const target = Math.round(FALLBACK_RUP.length * 0.5);

  // Random subset of indices.
  const indices = [...FALLBACK_RUP.keys()].sort(() => rand() - 0.5).slice(0, target);

  for (let i = 0; i < indices.length; i++) {
    const r = FALLBACK_RUP[indices[i]];
    const route = branchFor({
      provinsi: r.provinsi,
      instansi: r.nama_klpd,
      jenis_klpd: r.jenis_klpd,
    }) || { unit_kerja: PUSAT, unit_kerja_region: getRegion(PUSAT) };

    const status = statuses[Math.floor(rand() * statuses.length)];
    try {
      const { error } = await supabase
        .from('rup_watchlist')
        .upsert({
          kd_rup: String(r.kd_rup),
          nama_paket: r.nama_paket,
          nama_klpd: r.nama_klpd,
          pagu: r.pagu,
          status_internal: status,
          unit_kerja: route.unit_kerja,
          unit_kerja_region: route.unit_kerja_region,
          claimed_at: nowIso,
        }, { onConflict: 'kd_rup' });
      if (error) throw error;
      claimed++;
    } catch (e) {
      errors++;
      console.warn(`[seed rup ${r.kd_rup}] ${e.message}`);
    }
    onProgress({ phase: 'rup', done: i + 1, total: indices.length, claimed, errors });
  }
  return { claimed, errors };
}

export async function seedAllClaims(onProgress = () => {}) {
  const t = await seedTenderClaims(onProgress);
  const r = await seedRupClaims(onProgress);
  return { tender: t, rup: r };
}
