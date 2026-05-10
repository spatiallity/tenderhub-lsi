"""Inspect expert_projects rows that have missing / empty uraian_tugas."""
import asyncio
from sqlalchemy import text
from app.core.database import engine


async def main() -> None:
    async with engine.connect() as conn:
        total = (await conn.execute(text("SELECT COUNT(*) FROM expert_projects"))).scalar_one()
        empty = (await conn.execute(text(
            "SELECT COUNT(*) FROM expert_projects "
            "WHERE uraian_tugas IS NULL OR TRIM(uraian_tugas) = '' OR LOWER(TRIM(uraian_tugas)) = 'belum diisi'"
        ))).scalar_one()
        print(f"Total projects: {total}")
        print(f"Empty uraian_tugas: {empty}")

        # Sample of projects needing fill
        rows = (await conn.execute(text(
            "SELECT p.id, e.nama AS expert_nama, p.peran, p.posisi_penugasan, p.nama_proyek, p.uraian_tugas "
            "FROM expert_projects p JOIN experts e ON p.expert_id = e.id "
            "WHERE p.uraian_tugas IS NULL OR TRIM(p.uraian_tugas) = '' OR LOWER(TRIM(p.uraian_tugas)) = 'belum diisi' "
            "ORDER BY p.id LIMIT 15"
        ))).mappings().all()
        print("\nSample rows needing fill:")
        for r in rows:
            peran = r.get("posisi_penugasan") or r.get("peran") or "—"
            nama_proyek = (r.get("nama_proyek") or "")[:60]
            print(f"  id={r['id']} | peran={peran[:30]:30} | proyek={nama_proyek}")

        # Distinct roles so we can build a per-role template library
        roles = (await conn.execute(text(
            "SELECT COALESCE(NULLIF(TRIM(posisi_penugasan), ''), NULLIF(TRIM(peran), ''), '—') AS role, "
            "COUNT(*) AS c FROM expert_projects "
            "WHERE uraian_tugas IS NULL OR TRIM(uraian_tugas) = '' OR LOWER(TRIM(uraian_tugas)) = 'belum diisi' "
            "GROUP BY 1 ORDER BY c DESC"
        ))).mappings().all()
        print(f"\nDistinct empty-uraian roles ({len(roles)}):")
        for r in roles:
            print(f"  {r['c']:3}x  {r['role']}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
