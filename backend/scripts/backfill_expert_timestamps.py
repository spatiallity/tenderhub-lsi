"""One-shot backfill for NULL created_at/updated_at on experts / expert_projects
/ expert_reviews rows that predate the model's ``default=datetime.utcnow``
constraint. Runs idempotently — rows with values are left untouched.
"""
import asyncio
from sqlalchemy import text
from app.core.database import engine


async def main() -> None:
    statements = [
        "UPDATE experts SET created_at = COALESCE(created_at, NOW())",
        "UPDATE experts SET updated_at = COALESCE(updated_at, NOW())",
        "UPDATE expert_projects SET created_at = COALESCE(created_at, NOW())",
        "UPDATE expert_reviews SET created_at = COALESCE(created_at, NOW())",
    ]
    async with engine.begin() as conn:
        for stmt in statements:
            res = await conn.execute(text(stmt))
            print(f"OK  {stmt}  (rows={res.rowcount})")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
