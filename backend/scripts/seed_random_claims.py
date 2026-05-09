"""Seed tender + RUP claims via geographic routing.

Rules (per TASKS.md addendum 2026-05-09):
  - Tenders with internalStatus in {Akan Diikuti, Sudah Diikuti, Menang, Kalah}
    MUST have a unit_kerja claim.
  - K/L (Kementerian / Lembaga / BUMN pusat) -> SBU LSI Pusat.
  - Pemprov / Pemkab / Pemkot -> nearest cabang via PROVINCE_TO_BRANCH map.
  - Tenders with status Dipantau / Tidak Relevan / None stay UNCLAIMED.
  - RUP gets the same geographic rule applied to a random ~50% subset.

Idempotent — uses upsert on kd_tender / kd_rup.
"""
from __future__ import annotations

import os
import sys
import random
from datetime import datetime, timezone

_REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_BACKEND_DIR = os.path.join(_REPO_ROOT, "backend")
sys.path.insert(0, _REPO_ROOT)
sys.path.insert(0, _BACKEND_DIR)

from supabase import create_client
from app.core.unit_kerja import get_region
from app.core.branch_routing import branch_for, PUSAT
from app.services.dummy_data import TENDERS_RAW, RUP_RAW

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

ACTIVE_STATUSES = {"Akan Diikuti", "Sudah Diikuti", "Menang", "Kalah"}
RUP_CLAIM_RATIO = 0.5  # claim ~half of RUP


def seed_tender_claims(client):
    print("\n>> Tender claims (status-driven + geographic)")
    now_iso = datetime.now(timezone.utc).isoformat()
    success = 0
    skipped = 0
    no_route = 0

    for t in TENDERS_RAW:
        status = t.get("internalStatus") or "Dipantau"
        if status not in ACTIVE_STATUSES:
            skipped += 1
            continue

        unit = branch_for(
            provinsi=t.get("provinsi"),
            instansi=t.get("instansi", ""),
            jenis_klpd=t.get("jenis_klpd", ""),
            level=t.get("level", ""),
        )
        if not unit:
            no_route += 1
            unit = PUSAT  # fallback so claim never silently dropped

        try:
            client.table("tender_watchlist").upsert({
                "kd_tender": int(t["kd_tender"]),
                "nama_paket": t.get("nama"),
                "nama_klpd": t.get("instansi"),
                "hps": t.get("hps"),
                "status_internal": status,
                "unit_kerja": unit,
                "unit_kerja_region": get_region(unit),
                "claimed_at": now_iso,
            }, on_conflict="kd_tender").execute()
            success += 1
        except Exception as e:
            print(f"  [tender {t['kd_tender']}] ERR: {e}")

    print(f"  Claimed: {success} | Unclaimed (Dipantau/Tidak Relevan): {skipped} | Fallback to Pusat: {no_route}")


def seed_rup_claims(client):
    print(f"\n>> RUP claims (~{int(RUP_CLAIM_RATIO * 100)}% via geographic routing)")
    now_iso = datetime.now(timezone.utc).isoformat()
    n_target = int(len(RUP_RAW) * RUP_CLAIM_RATIO)
    indices = random.sample(range(len(RUP_RAW)), n_target)
    success = 0
    fallback = 0

    statuses = ["Akan Diikuti", "Sudah Diikuti", "Menang", "Kalah"]
    weights = [40, 35, 15, 10]

    for idx in indices:
        r = RUP_RAW[idx]
        unit = branch_for(
            provinsi=r.get("provinsi"),
            instansi=r.get("nama_klpd", ""),
            jenis_klpd=r.get("jenis_klpd", ""),
        )
        if not unit:
            unit = PUSAT
            fallback += 1

        status = random.choices(statuses, weights=weights)[0]
        try:
            client.table("rup_watchlist").upsert({
                "kd_rup": str(r["kd_rup"]),
                "nama_paket": r.get("nama_paket"),
                "nama_klpd": r.get("nama_klpd"),
                "pagu": r.get("pagu"),
                "status_internal": status,
                "unit_kerja": unit,
                "unit_kerja_region": get_region(unit),
                "claimed_at": now_iso,
            }, on_conflict="kd_rup").execute()
            success += 1
        except Exception as e:
            print(f"  [rup {r['kd_rup']}] ERR: {e}")

    print(f"  Claimed: {success}/{n_target} | Fallback to Pusat: {fallback}")


def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("ERR: set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars first.")
        sys.exit(1)
    random.seed(42)
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    seed_tender_claims(client)
    seed_rup_claims(client)
    print("\nDone.")


if __name__ == "__main__":
    main()
