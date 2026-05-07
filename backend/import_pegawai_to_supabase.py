"""One-shot import: Data Pegawai SBU LSI.xlsx -> Supabase contact_persons.

Usage:
    cd backend
    py -3 import_pegawai_to_supabase.py [path/to/Data Pegawai SBU LSI.xlsx]

Reads SUPABASE_URL + SUPABASE_SERVICE_KEY from backend/.env.production
(falls back to env vars). Phone numbers are dummy (08xxxxxxxxxx) since the
source file does not include them. Email blank.

Idempotent: matches existing rows by (nama, divisi). Updates if found, inserts otherwise.
Run prerequisites:
    pip install openpyxl supabase python-dotenv
"""
from __future__ import annotations

import os
import sys
import random
from pathlib import Path

import openpyxl
from dotenv import load_dotenv
from supabase import create_client


HEADER_ROW = 3                # 1-indexed (row 3 holds: No / Employee Name / Job Name / Jabatan / Bagian / Bagian/ Sub Porto / Gender)
COL_NAMA = 'Employee Name'
COL_JOB = 'Job Name'
COL_JABATAN = 'Jabatan'
COL_BAGIAN = 'Bagian'
COL_SUB_PORTO = 'Bagian/ Sub Porto'


def dummy_phone(seed: str) -> str:
    rnd = random.Random(seed)
    return '628' + ''.join(str(rnd.randint(0, 9)) for _ in range(10))


def main(xlsx_path: str | None = None) -> int:
    repo_root = Path(__file__).resolve().parent.parent
    if not xlsx_path:
        xlsx_path = repo_root / 'Data Pegawai SBU LSI.xlsx'
    xlsx_path = Path(xlsx_path)
    if not xlsx_path.exists():
        print(f'[error] xlsx not found: {xlsx_path}')
        return 1

    # Load env
    for cand in (repo_root / '.env.production', Path(__file__).parent / '.env'):
        if cand.exists():
            load_dotenv(cand)
            break
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    if not url or not key:
        print('[error] SUPABASE_URL / SUPABASE_SERVICE_KEY not set')
        return 2

    sb = create_client(url, key)
    print(f'[info] connected to {url}')

    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb.active
    rows = list(ws.rows)
    if len(rows) < HEADER_ROW + 1:
        print('[error] sheet too short')
        return 3

    headers = [str(c.value).strip() if c.value else '' for c in rows[HEADER_ROW - 1]]
    try:
        ix_nama = headers.index(COL_NAMA)
        ix_jabatan = headers.index(COL_JABATAN)
        ix_bagian = headers.index(COL_BAGIAN)
        ix_sub_porto = headers.index(COL_SUB_PORTO)
    except ValueError as e:
        print(f'[error] missing column: {e}; headers={headers}')
        return 4

    inserted = 0
    updated = 0
    skipped = 0
    for r in rows[HEADER_ROW:]:
        nama = (r[ix_nama].value or '').strip() if r[ix_nama].value else ''
        if not nama:
            continue
        jabatan = str(r[ix_jabatan].value or '').strip() or None
        bagian = str(r[ix_bagian].value or '').strip() or None
        sub_porto = str(r[ix_sub_porto].value or '').strip() or None
        divisi = sub_porto or 'Lainnya'

        payload = {
            'nama': nama,
            'jabatan': jabatan,
            'divisi': divisi,
            'sub_porto': sub_porto,
            'no_wa': dummy_phone(nama),
            'email': None,
            'catatan': bagian if bagian and bagian != divisi else None,
        }

        existing = sb.table('contact_persons') \
            .select('id') \
            .eq('nama', nama) \
            .eq('divisi', divisi) \
            .limit(1) \
            .execute()
        try:
            if existing.data:
                sb.table('contact_persons').update(payload).eq('id', existing.data[0]['id']).execute()
                updated += 1
            else:
                sb.table('contact_persons').insert(payload).execute()
                inserted += 1
        except Exception as e:
            print(f'[warn] failed for {nama}: {e}')
            skipped += 1

    print(f'[done] inserted={inserted} updated={updated} skipped={skipped}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else None))
