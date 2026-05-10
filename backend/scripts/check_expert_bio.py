"""Inspect experts rows that have missing bio / education fields."""
import asyncio
from sqlalchemy import text
from app.core.database import engine


async def main() -> None:
    async with engine.connect() as conn:
        total = (await conn.execute(text("SELECT COUNT(*) FROM experts"))).scalar_one()
        print(f"Total experts: {total}")

        cols = ("tempat_lahir", "tanggal_lahir", "pendidikan_formal", "pendidikan_non_formal", "penguasaan_bahasa", "posisi_diusulkan")
        for c in cols:
            q = f"SELECT COUNT(*) FROM experts WHERE {c} IS NULL"
            if c in ("pendidikan_formal", "pendidikan_non_formal", "penguasaan_bahasa"):
                q += f" OR {c}::text = '[]' OR {c}::text = 'null'"
            empty = (await conn.execute(text(q))).scalar_one()
            print(f"  {c}: {empty} empty")

        rows = (await conn.execute(text(
            "SELECT id, nama, main_keahlian, keahlian, subporto, instansi, tempat_lahir, tanggal_lahir, "
            "pendidikan_formal, pendidikan_non_formal, penguasaan_bahasa, posisi_diusulkan "
            "FROM experts ORDER BY id LIMIT 5"
        ))).mappings().all()
        print("\nSample rows:")
        for r in rows:
            print(f"  id={r['id']} | {r['nama'][:40]:40} | main={r['main_keahlian']}")
            print(f"    subporto={r['subporto']} | instansi={(r['instansi'] or '')[:40]}")
            print(f"    tempat_lahir={r['tempat_lahir']!r}  tanggal_lahir={r['tanggal_lahir']!r}")
            print(f"    pend_formal={r['pendidikan_formal']}")
            print(f"    pend_nonformal={r['pendidikan_non_formal']}")
            print(f"    bahasa={r['penguasaan_bahasa']}")
            print(f"    posisi_diusulkan={r['posisi_diusulkan']!r}")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
