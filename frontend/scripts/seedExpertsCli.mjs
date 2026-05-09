#!/usr/bin/env node
/**
 * Upload localhost FALLBACK_EXPERTS rich data (10 projects + 5 reviews each)
 * to Supabase, so production sees the same content.
 *
 * Strategy:
 *   - For each expert in Supabase (existing 17), find matching FALLBACK by `nama`.
 *   - Wipe expert_projects + expert_reviews for that expert.
 *   - Insert FALLBACK projects + reviews fresh.
 *   - Pick reviewer_nama from contact_persons (real names).
 *
 * Run from repo root:
 *   node frontend/scripts/seedExpertsCli.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ENV_PATH = path.join(REPO_ROOT, 'backend', '.env');

try {
  const lines = readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) { console.warn(`[seed] cannot read ${ENV_PATH}: ${e.message}`); }

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERR: SUPABASE_URL + SUPABASE_SERVICE_KEY required.');
  process.exit(1);
}

const { createClient } = await import('@supabase/supabase-js');
const { FALLBACK_EXPERTS } = await import(new URL('../src/data/demoData.js', import.meta.url));

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Pull real names from contact_persons to use as reviewers.
const contactsRes = await client.from('contact_persons').select('nama').order('nama');
const reviewerPool = (contactsRes.data || []).map(r => r.nama).filter(Boolean);
if (!reviewerPool.length) {
  console.warn('[seed] contact_persons empty — fallback to dummy reviewer name in JSON.');
}
const pickReviewer = (i) => reviewerPool.length ? reviewerPool[i % reviewerPool.length] : null;

// Pull existing experts.
const expertsRes = await client.from('experts').select('id, nama');
const existing = expertsRes.data || [];
console.log(`[seed] supabase experts: ${existing.length}, FALLBACK_EXPERTS: ${FALLBACK_EXPERTS.length}`);

// Index existing by lowercase nama for fuzzy match.
const byNama = new Map();
existing.forEach(e => byNama.set(e.nama.trim().toLowerCase(), e));

let projectsTotal = 0, reviewsTotal = 0, matched = 0;

for (const fb of FALLBACK_EXPERTS) {
  const key = (fb.nama || '').trim().toLowerCase();
  let target = byNama.get(key);
  if (!target) {
    // Insert new expert from FALLBACK row.
    const newExpert = {
      nama: fb.nama,
      no_hp: fb.noHp || fb.no_hp || null,
      instansi: fb.instansi || 'Eksternal SUCOFINDO',
      jenis_instansi: 'eksternal',
      keahlian: fb.keahlian || [],
      subporto: fb.portofolio || fb.subporto || [],
      main_keahlian: fb.main || fb.main_keahlian || null,
      availability: fb.availability || 'Tersedia',
      rating_avg: fb.rating || fb.rating_avg || 4.5,
      jumlah_proyek: fb.proyek || fb.jumlah_proyek || (fb.history || []).length,
      tempat_lahir: fb.tempat_lahir || null,
      tanggal_lahir: fb.tanggal_lahir || null,
      pendidikan_formal: fb.pendidikan_formal || [],
      pendidikan_non_formal: fb.pendidikan_non_formal || [],
      penguasaan_bahasa: fb.penguasaan_bahasa || [],
      posisi_diusulkan: fb.posisi_diusulkan || null,
    };
    const { data: created, error: ce } = await client.from('experts').insert(newExpert).select('id, nama').single();
    if (ce) { console.warn(`  [insert ${fb.nama}] ${ce.message}`); continue; }
    target = created;
    byNama.set(key, target);
    console.log(`  [+expert] inserted ${fb.nama} -> id=${target.id}`);
  }
  matched++;
  const expertId = target.id;

  // Wipe existing projects + reviews for this expert.
  await client.from('expert_projects').delete().eq('expert_id', expertId);
  await client.from('expert_reviews').delete().eq('expert_id', expertId);

  // Insert projects from FALLBACK.history.
  const projects = (fb.history || []).map(p => ({
    expert_id: expertId,
    nama_proyek: p.proyek || p.nama_proyek || 'Proyek',
    pemberi_kerja: p.klien || p.pemberi_kerja || null,
    tahun: p.tahun ? parseInt(p.tahun) || null : null,
    nilai_proyek: p.nilai || p.nilai_proyek || null,
    peran: p.peran || null,
    bersama: p.bersama || null,
    nama_perusahaan_lain: p.nama_perusahaan_lain || null,
    status_proyek: p.status || p.status_proyek || 'Selesai',
    lokasi_proyek: p.lokasi_proyek || null,
    pengguna_jasa: p.pengguna_jasa || null,
    uraian_tugas: p.uraian_tugas || null,
    waktu_mulai: p.waktu_mulai || null,
    waktu_selesai: p.waktu_selesai || null,
    posisi_penugasan: p.posisi_penugasan || null,
    status_kepegawaian: p.status_kepegawaian || null,
    surat_referensi: p.surat_referensi || null,
  }));
  if (projects.length) {
    const { error } = await client.from('expert_projects').insert(projects);
    if (error) console.warn(`  [proj ${fb.nama}] ${error.message}`);
    else projectsTotal += projects.length;
  }

  // Insert reviews from FALLBACK.reviews. Override reviewer_nama with real name.
  const reviews = (fb.reviews || []).map((r, i) => ({
    expert_id: expertId,
    reviewer_nama: pickReviewer(target.id * 7 + i) || r.reviewer || 'Anonymous',
    rating: parseInt(r.rating) || 5,
    komentar: r.komentar || null,
    nama_proyek_ref: r.nama_proyek_ref || null,
  }));
  if (reviews.length) {
    const { error } = await client.from('expert_reviews').insert(reviews);
    if (error) console.warn(`  [rev ${fb.nama}] ${error.message}`);
    else reviewsTotal += reviews.length;
  }

  process.stdout.write(`  ${matched}/${existing.length} ${fb.nama.slice(0, 30)}...                          \r`);
}

console.log(`\n[seed] done. matched=${matched}, projects=${projectsTotal}, reviews=${reviewsTotal}`);
