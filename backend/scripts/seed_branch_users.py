"""Seed branch user accounts in Supabase Auth + profiles.

Run from repo root:
    python -m backend.scripts.seed_branch_users

Idempotent — re-running will not duplicate users (Supabase Auth rejects
duplicate emails); profiles are upserted.

Per TASKS.md Section 6:
  - One Admin {Unit Kerja} account per branch (role 'cabang')
  - One Admin SBU LSI account (role 'pusat')
  - One Super Admin account (role 'admin')
  - All passwords: password123
"""
from __future__ import annotations

import os
import sys
from typing import Optional

# Allow running both as module (-m backend.scripts.seed_branch_users) and as
# a standalone script. When run standalone, the parent dir is added to path.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from supabase import create_client
from backend.app.core.unit_kerja import UNIT_KERJA, email_slug, get_region

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

DEFAULT_PASSWORD = "password123"


def upsert_user(client, email: str, name: str, role: str, unit_kerja: Optional[str]) -> Optional[str]:
    """Create auth user (if missing), then upsert profiles row. Returns user id."""
    # 1. Create auth user. If email exists, the SDK raises — catch and lookup existing id.
    try:
        resp = client.auth.admin.create_user({
            "email": email,
            "password": DEFAULT_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": name, "role": role, "unit_kerja": unit_kerja or ""},
        })
        user_id = resp.user.id
        print(f"  [auth] created {email} -> {user_id}")
    except Exception as e:
        # Already exists — list users and find by email.
        if "already registered" in str(e).lower() or "duplicate" in str(e).lower() or "email" in str(e).lower():
            print(f"  [auth] {email} exists, looking up id...")
            # Iterate paginated users until found.
            user_id = None
            page = 1
            while True:
                lst = client.auth.admin.list_users(page=page, per_page=100)
                items = getattr(lst, "users", lst)  # supabase-py shapes vary
                if not items:
                    break
                for u in items:
                    u_email = getattr(u, "email", None) or (u.get("email") if isinstance(u, dict) else None)
                    if u_email == email:
                        user_id = getattr(u, "id", None) or u.get("id")
                        break
                if user_id or len(items) < 100:
                    break
                page += 1
            if not user_id:
                print(f"  [auth] WARN: could not resolve {email}, skipping profile.")
                return None
        else:
            print(f"  [auth] ERR creating {email}: {e}")
            return None

    # 2. Upsert profile.
    try:
        client.table("profiles").upsert({
            "id": user_id,
            "email": email,
            "name": name,
            "role": role,
            "unit_kerja": unit_kerja,
            "unit_kerja_region": get_region(unit_kerja) if unit_kerja else None,
            "is_active": True,
        }).execute()
        print(f"  [profile] upserted {email} role={role} unit={unit_kerja or '-'}")
    except Exception as e:
        print(f"  [profile] ERR upserting {email}: {e}")
    return user_id


def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("ERR: set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars first.")
        sys.exit(1)

    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print(f"Connecting to {SUPABASE_URL}")

    # Super admin first.
    print("\n>> Super Admin")
    upsert_user(client, "admin@sucofindo.co.id", "Super Admin", "admin", None)

    # Each branch.
    for unit in UNIT_KERJA:
        name = unit["name"]
        email = f"{email_slug(name)}@sucofindo.co.id"
        display = f"Admin {name}"
        role = "pusat" if name == "SBU LSI" else "cabang"
        print(f"\n>> {display} ({email}, role={role})")
        upsert_user(client, email, display, role, name)

    print("\nDone. All accounts use password: password123")


if __name__ == "__main__":
    main()
