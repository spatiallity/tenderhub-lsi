"""
Cleanup duplicate experts from database
Run this script to remove all experts with numbers in parentheses like (17), (18), etc.

Usage:
    python cleanup_duplicates.py
"""

import asyncio
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.models.expert import Expert

async def cleanup_duplicates():
    async with AsyncSessionLocal() as db:
        # Count duplicates
        result = await db.execute(
            select(Expert).where(Expert.nama.regexp_match(r'\s+\(\d+\)$'))
        )
        duplicates = result.scalars().all()
        
        print(f"🔍 Found {len(duplicates)} duplicate experts:")
        for expert in duplicates[:10]:  # Show first 10
            print(f"   - {expert.nama} (ID: {expert.id})")
        if len(duplicates) > 10:
            print(f"   ... and {len(duplicates) - 10} more")
        
        if len(duplicates) == 0:
            print("✅ No duplicates found! Database is clean.")
            return
        
        # Confirm deletion
        print(f"\n⚠️  About to delete {len(duplicates)} duplicate experts.")
        confirm = input("Continue? (yes/no): ")
        
        if confirm.lower() != 'yes':
            print("❌ Cleanup cancelled.")
            return
        
        # Delete duplicates
        await db.execute(
            delete(Expert).where(Expert.nama.regexp_match(r'\s+\(\d+\)$'))
        )
        await db.commit()
        
        # Verify
        result = await db.execute(select(Expert))
        remaining = result.scalars().all()
        
        print(f"\n✅ Cleanup complete!")
        print(f"📊 Remaining experts: {len(remaining)}")
        print(f"\nExperts in database:")
        for expert in remaining:
            print(f"   - {expert.nama} (ID: {expert.id})")

if __name__ == "__main__":
    print("🧹 Starting duplicate experts cleanup...\n")
    asyncio.run(cleanup_duplicates())
