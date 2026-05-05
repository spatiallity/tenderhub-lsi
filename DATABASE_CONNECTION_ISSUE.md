# Database Connection Issue - Status Update

## Problem Summary
Internal status changes, notes, and PIC assignments are not syncing across users because the **backend API is not running**.

## Root Cause
The backend fails to start with error: `asyncpg.exceptions.InternalServerError: Tenant or user not found`

This error indicates that the Supabase database connection credentials in `backend/.env` are incorrect.

## Current Configuration
```env
DATABASE_URL=postgresql+asyncpg://postgres:Sucofindo2024%21@db.aedojcjkhorogsgwasab.supabase.co:5432/postgres
```

## How the Sync Works
1. **Frontend** (AppContext.jsx) has these functions:
   - `updateTenderStatus()` - Updates status and syncs to `/api/v1/watchlist/{tenderId}`
   - `updateTenderPIC()` - Updates PIC and syncs to `/api/v1/watchlist/{tenderId}`
   - `addTenderNote()` - Adds note and syncs to `/api/v1/watchlist/{tenderId}`

2. **Backend** (watchlist.py) has API endpoints:
   - `PATCH /api/v1/watchlist/{kd_tender}` - Updates watchlist entry in database
   - Stores data in `tender_watchlist` table in Supabase

3. **Without backend running**:
   - Changes only save to browser's localStorage
   - Other users don't see the changes
   - Data is not persistent across devices

## Solution Options

### Option 1: Fix Supabase Connection (Recommended)
You need to provide the correct Supabase connection string. Please check:

1. **Supabase Dashboard** → Your Project → Settings → Database
2. Look for **Connection String** section
3. Choose **Connection Pooling** (recommended) or **Direct Connection**
4. Copy the connection string and replace in `backend/.env`

**Format for Connection Pooling:**
```env
DATABASE_URL=postgresql+asyncpg://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Format for Direct Connection:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Important Notes:**
- Replace `[PROJECT-REF]` with your actual project reference (e.g., `aedojcjkhorogsgwasab`)
- Replace `[PASSWORD]` with your actual database password
- Special characters in password must be URL-encoded (e.g., `!` becomes `%21`)
- The password is NOT the same as your Supabase account password

### Option 2: Create Required Tables in Supabase
If the connection string is correct but tables don't exist, you need to create them:

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL to create the required tables:

```sql
-- Create tender_watchlist table
CREATE TABLE IF NOT EXISTS public.tender_watchlist (
    id SERIAL PRIMARY KEY,
    kd_tender INTEGER NOT NULL,
    nama_paket VARCHAR(400),
    nama_klpd VARCHAR(300),
    hps FLOAT,
    status_internal VARCHAR(50) DEFAULT 'Dipantau',
    catatan_internal TEXT,
    assigned_pic VARCHAR(100),
    assigned_expert_ids JSONB DEFAULT '[]'::jsonb,
    subporto_rekomendasi VARCHAR(10),
    relevance_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_kd_tender ON public.tender_watchlist(kd_tender);

-- Create tender_cache table
CREATE TABLE IF NOT EXISTS public.tender_cache (
    id SERIAL PRIMARY KEY,
    kd_tender INTEGER NOT NULL UNIQUE,
    raw_data JSONB,
    tahapan_data JSONB,
    last_fetched_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cache_kd_tender ON public.tender_cache(kd_tender);

-- Enable RLS (Row Level Security)
ALTER TABLE public.tender_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to access watchlist
CREATE POLICY "Watchlist accessible by authenticated users"
    ON public.tender_watchlist
    FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- Allow authenticated users to access cache
CREATE POLICY "Cache accessible by authenticated users"
    ON public.tender_cache
    FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);
```

### Option 3: Use Local PostgreSQL Instead
If you prefer not to use Supabase:

1. Install PostgreSQL locally
2. Create database:
   ```sql
   CREATE USER lsi WITH PASSWORD 'lsi_password';
   CREATE DATABASE lsi_tender OWNER lsi;
   ```
3. Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql+asyncpg://lsi:lsi_password@localhost:5432/lsi_tender
   ```
4. Run migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```

## Next Steps
1. Choose one of the solutions above
2. Update `backend/.env` with correct credentials
3. Backend will auto-reload (or restart it manually)
4. Test by changing status/notes/PIC and checking if other users see the changes

## Verification Steps
Once backend is running:
1. Open http://localhost:8000/docs - should show API documentation
2. Open http://localhost:8000/health - should return `{"status":"ok"}`
3. Make a status change in the app
4. Open the same tender in another browser/incognito - should see the change
