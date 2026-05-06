"""
Script to cleanup duplicate experts in Supabase database
Run this script to remove duplicate expert entries based on nama (name)
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, func, delete
from collections import defaultdict

# Import your models
import sys
sys.path.append('backend')
from app.models.expert import Expert
from app.core.config import settings

async def cleanup_duplicates():
    """Remove duplicate experts, keeping only the first occurrence of each name"""
    
    # Create engine
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        print("🔍 Checking for duplicate experts...")
        
        # Get all experts
        result = await db.execute(select(Expert).order_by(Expert.id))
        all_experts = result.scalars().all()
        
        print(f"📊 Total experts in database: {len(all_experts)}")
        
        # Group by name (case-insensitive)
        experts_by_name = defaultdict(list)
        for expert in all_experts:
            name_key = expert.nama.lower().strip() if expert.nama else ""
            experts_by_name[name_key].append(expert)
        
        # Find duplicates
        duplicates_found = 0
        experts_to_delete = []
        
        for name, experts in experts_by_name.items():
            if len(experts) > 1:
                duplicates_found += 1
                print(f"\n❌ Found {len(experts)} duplicates for: {experts[0].nama}")
                print(f"   IDs: {[e.id for e in experts]}")
                
                # Keep the first one (lowest ID), mark others for deletion
                experts_sorted = sorted(experts, key=lambda e: e.id)
                keep = experts_sorted[0]
                to_delete = experts_sorted[1:]
                
                print(f"   ✅ Keeping ID {keep.id}")
                print(f"   🗑️  Deleting IDs: {[e.id for e in to_delete]}")
                
                experts_to_delete.extend(to_delete)
        
        if duplicates_found == 0:
            print("\n✅ No duplicates found! Database is clean.")
            return
        
        print(f"\n📊 Summary:")
        print(f"   - Duplicate names found: {duplicates_found}")
        print(f"   - Total experts to delete: {len(experts_to_delete)}")
        print(f"   - Experts to keep: {len(all_experts) - len(experts_to_delete)}")
        
        # Ask for confirmation
        print(f"\n⚠️  WARNING: This will DELETE {len(experts_to_delete)} expert records!")
        confirm = input("Type 'YES' to proceed with deletion: ")
        
        if confirm != 'YES':
            print("❌ Deletion cancelled.")
            return
        
        # Delete duplicates
        print("\n🗑️  Deleting duplicates...")
        for expert in experts_to_delete:
            await db.delete(expert)
        
        await db.commit()
        print(f"\n✅ Successfully deleted {len(experts_to_delete)} duplicate experts!")
        
        # Verify
        result = await db.execute(select(func.count()).select_from(Expert))
        final_count = result.scalar_one()
        print(f"📊 Final expert count: {final_count}")

async def list_all_experts():
    """List all experts with their IDs and names"""
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Expert).order_by(Expert.nama))
        experts = result.scalars().all()
        
        print(f"\n📋 All Experts ({len(experts)} total):")
        print("=" * 80)
        
        for i, expert in enumerate(experts, 1):
            print(f"{i:3d}. ID: {expert.id:4d} | {expert.nama:40s} | {expert.instansi or 'N/A'}")
        
        print("=" * 80)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        print("📋 Listing all experts...")
        asyncio.run(list_all_experts())
    else:
        print("🧹 Cleanup Duplicate Experts Script")
        print("=" * 80)
        asyncio.run(cleanup_duplicates())
