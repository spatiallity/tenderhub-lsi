"""
Simple script to cleanup duplicate experts
Run: python cleanup_experts_simple.py
"""

import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, func, text
from collections import defaultdict

# Database URL from environment or hardcoded
DATABASE_URL = "postgresql+asyncpg://postgres.aedojcjkhorogsgwasab:TenderHub2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"

async def list_duplicates():
    """List all duplicate experts"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        # Get all experts with duplicate names
        query = text("""
            SELECT 
                nama,
                COUNT(*) as duplicate_count,
                ARRAY_AGG(id ORDER BY id) as all_ids
            FROM experts
            GROUP BY LOWER(TRIM(nama))
            HAVING COUNT(*) > 1
            ORDER BY duplicate_count DESC, nama
        """)
        
        result = await db.execute(query)
        duplicates = result.fetchall()
        
        if not duplicates:
            print("✅ No duplicates found! Database is clean.")
            return []
        
        print(f"\n📊 Found {len(duplicates)} duplicate names:\n")
        print("=" * 80)
        
        total_to_delete = 0
        for row in duplicates:
            nama, count, ids = row
            keep_id = ids[0]
            delete_ids = ids[1:]
            total_to_delete += len(delete_ids)
            
            print(f"❌ {nama}")
            print(f"   Count: {count}")
            print(f"   IDs: {ids}")
            print(f"   ✅ Keep: {keep_id}")
            print(f"   🗑️  Delete: {delete_ids}")
            print()
        
        print("=" * 80)
        print(f"\n📊 Summary:")
        print(f"   - Duplicate names: {len(duplicates)}")
        print(f"   - Total experts to delete: {total_to_delete}")
        print()
        
        return duplicates

async def cleanup_duplicates():
    """Delete duplicate experts, keeping the first one (lowest ID)"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        # Delete duplicates using SQL
        query = text("""
            WITH duplicates AS (
                SELECT 
                    id,
                    nama,
                    ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(nama)) ORDER BY id) as row_num
                FROM experts
            )
            DELETE FROM experts
            WHERE id IN (
                SELECT id 
                FROM duplicates 
                WHERE row_num > 1
            )
            RETURNING id, nama
        """)
        
        result = await db.execute(query)
        deleted = result.fetchall()
        await db.commit()
        
        print(f"\n✅ Successfully deleted {len(deleted)} duplicate experts!")
        
        if deleted:
            print("\nDeleted experts:")
            for expert_id, nama in deleted[:10]:  # Show first 10
                print(f"   - ID {expert_id}: {nama}")
            if len(deleted) > 10:
                print(f"   ... and {len(deleted) - 10} more")
        
        return len(deleted)

async def verify_cleanup():
    """Verify that all duplicates are removed"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        query = text("""
            SELECT 
                nama,
                COUNT(*) as count
            FROM experts
            GROUP BY LOWER(TRIM(nama))
            HAVING COUNT(*) > 1
        """)
        
        result = await db.execute(query)
        remaining = result.fetchall()
        
        if not remaining:
            print("\n✅ Verification passed! No duplicates remaining.")
            return True
        else:
            print(f"\n⚠️  Warning: Still found {len(remaining)} duplicates:")
            for nama, count in remaining:
                print(f"   - {nama}: {count} occurrences")
            return False

async def main():
    print("🧹 Expert Duplicate Cleanup Tool")
    print("=" * 80)
    
    # Step 1: List duplicates
    print("\n📋 Step 1: Listing duplicates...")
    duplicates = await list_duplicates()
    
    if not duplicates:
        return
    
    # Step 2: Ask for confirmation
    print("\n⚠️  WARNING: This will DELETE duplicate expert records!")
    print("The first occurrence (lowest ID) will be kept.")
    confirm = input("\nType 'YES' to proceed with deletion: ")
    
    if confirm != 'YES':
        print("❌ Deletion cancelled.")
        return
    
    # Step 3: Cleanup
    print("\n🗑️  Step 2: Deleting duplicates...")
    deleted_count = await cleanup_duplicates()
    
    # Step 4: Verify
    print("\n🔍 Step 3: Verifying cleanup...")
    await verify_cleanup()
    
    print("\n✅ Cleanup complete!")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user.")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
