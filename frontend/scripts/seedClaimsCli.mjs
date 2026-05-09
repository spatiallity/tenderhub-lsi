#!/usr/bin/env node
/**
 * Node CLI seeder. Imports frontend dummy data + branchRouting, upserts to Supabase.
 *
 * ALL tenders + ALL RUP get claimed by nearest unit_kerja (per latest TASKS update).
 *
 * Run from repo root:
 *   node frontend/scripts/seedClaimsCli.mjs
 *
 * Reads SUPABASE_URL + SUPABASE_SERVICE_KEY from backend/.env (auto-loads).
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ENV_PATH = path.join(REPO_ROOT, 'backend', '.env');

// Tiny .env loader (no extra dep).
try {
  const lines = readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) {
  console.warn(`[seed] could not read ${ENV_PATH}: ${e.message}`);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERR: SUPABASE_URL + SUPABASE_SERVICE_KEY required (set in backend/.env or env).');
  process.exit(1);
}

const { createClient } = await import('@supabase/supabase-js');
const { FALLBACK_TENDERS } = await import(new URL('../src/data/demoData.js', import.meta.url));
const { FALLBACK_RUP } = await import(new URL('../src/data/rupDummy.js', import.meta.url));
const { branchFor, PUSAT } = await import(new URL('../src/utils/branchRouting.js', import.meta.url));
const { getRegion } = await import(new URL('../src/utils/unitKerja.js', import.meta.url));

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function clearOldClaims() {
  console.log('[seed] clearing existing tender_watchlist + rup_watchlist...');
  await client.from('tender_watchlist').delete().neq('id', 0);
  await client.from('rup_watchlist').delete().neq('id', 0);
}

async function seedTenders() {
  console.log(`[seed] tenders: ${FALLBACK_TENDERS.length} entries`);
  const nowIso = new Date().toISOString();
  let ok = 0, fail = 0;
  for (const t of FALLBACK_TENDERS) {
    const status = t.internalStatus || 'Dipantau';
    // Dipantau = unclaimed. Skip — leave row absent in tender_watchlist.
    if (status === 'Dipantau') continue;

    const route = branchFor({
      provinsi: t.provinsi,
      instansi: t.instansi,
      jenis_klpd: t.jenis_klpd,
      level: t.level,
      lokasi: t.lokasi_pekerjaan,
    }) || { unit_kerja: PUSAT, unit_kerja_region: getRegion(PUSAT) };
    const kdTender = parseInt(t.kd_tender || t.id);
    if (!kdTender) { fail++; continue; }
    const { error } = await client.from('tender_watchlist').upsert({
      kd_tender: kdTender,
      nama_paket: t.nama,
      nama_klpd: t.instansi,
      hps: t.hps,
      status_internal: status,
      unit_kerja: route.unit_kerja,
      unit_kerja_region: route.unit_kerja_region,
      claimed_at: nowIso,
    }, { onConflict: 'kd_tender' });
    if (error) { fail++; console.warn(`  [tender ${kdTender}] ${error.message}`); }
    else ok++;
    if ((ok + fail) % 25 === 0) process.stdout.write(`  ${ok + fail}/${FALLBACK_TENDERS.length}\r`);
  }
  console.log(`[seed] tenders: ok=${ok} fail=${fail}`);
}

async function seedRup() {
  console.log(`[seed] rup: ${FALLBACK_RUP.length} entries`);
  const nowIso = new Date().toISOString();
  // No Dipantau in claims — Dipantau = unclaimed.
  const statuses = ['Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah', 'Tidak Relevan'];
  const weights  = [50,             25,              10,       10,       5];
  const flat = [];
  statuses.forEach((s, i) => { for (let n = 0; n < weights[i]; n++) flat.push(s); });

  let ok = 0, fail = 0;
  // Claim ~60% of RUP (rest stay Dipantau / unclaimed).
  const target = Math.round(FALLBACK_RUP.length * 0.6);
  const indices = [...FALLBACK_RUP.keys()];
  // simple deterministic pick of first N after shuffle by id
  indices.sort((a, b) => (FALLBACK_RUP[a].id || 0) - (FALLBACK_RUP[b].id || 0));
  const claimIndices = indices.slice(0, target);

  for (let i = 0; i < claimIndices.length; i++) {
    const r = FALLBACK_RUP[claimIndices[i]];
    const route = branchFor({
      provinsi: r.provinsi,
      instansi: r.nama_klpd,
      jenis_klpd: r.jenis_klpd,
      lokasi: r.kabupaten || r.nama_klpd,
      kabupaten: r.kabupaten,
    }) || { unit_kerja: PUSAT, unit_kerja_region: getRegion(PUSAT) };
    const status = flat[i % flat.length];
    const { error } = await client.from('rup_watchlist').upsert({
      kd_rup: String(r.kd_rup),
      nama_paket: r.nama_paket,
      nama_klpd: r.nama_klpd,
      pagu: r.pagu,
      status_internal: status,
      unit_kerja: route.unit_kerja,
      unit_kerja_region: route.unit_kerja_region,
      claimed_at: nowIso,
    }, { onConflict: 'kd_rup' });
    if (error) { fail++; console.warn(`  [rup ${r.kd_rup}] ${error.message}`); }
    else ok++;
    if ((ok + fail) % 25 === 0) process.stdout.write(`  ${ok + fail}/${claimIndices.length}\r`);
  }
  console.log(`[seed] rup: ok=${ok} fail=${fail}`);
}

await clearOldClaims();
await seedTenders();
await seedRup();
console.log('[seed] done.');
