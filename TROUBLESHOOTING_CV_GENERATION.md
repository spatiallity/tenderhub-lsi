# Troubleshooting CV Generation - HTTP 404 Error

## Problem
Generate CV button returns: **HTTP 404 {"detail":"Not Found"}**

## Root Cause
The CV generation endpoint `/api/v1/cv/{expert_id}/cv` is not found on HuggingFace Space.

## Possible Reasons
1. **HuggingFace Space not deployed with latest code**
2. **CV router not registered in main.py**
3. **Template file missing on HuggingFace**

## Solution Steps

### Step 1: Verify Backend Code
Check that `backend/app/main.py` has:
```python
from app.api.v1 import cv_generator_dynamic as cv_generator
app.include_router(cv_generator.router, prefix="/api/v1/cv", tags=["CV Generator"])
```

### Step 2: Verify Template File Exists
Check that `backend/TEMPLATE_CV_EXPERT.docx` exists in the repository.

### Step 3: Test Endpoint Directly
Open in browser:
```
https://spatiallity-tenderhub-api.hf.space/api/v1/cv/1/cv
```

Expected: Download DOCX file
Actual: 404 Not Found

### Step 4: Check HuggingFace Space Logs
1. Go to https://huggingface.co/spaces/spatiallity/tenderhub-api
2. Click "Logs" tab
3. Look for errors during startup
4. Check if cv_generator router is loaded

### Step 5: Redeploy to HuggingFace
If code is correct but endpoint still 404, redeploy:

1. **Option A: Factory Reboot**
   - Go to Space Settings
   - Click "Factory reboot"
   - Wait for rebuild

2. **Option B: Push to HuggingFace Repo**
   ```bash
   # Add HuggingFace remote if not exists
   git remote add hf https://huggingface.co/spaces/spatiallity/tenderhub-api
   
   # Push latest code
   git push hf main --force
   ```

3. **Option C: Manual Sync**
   - Go to HuggingFace Space
   - Click "Files" tab
   - Upload missing files manually

### Step 6: Verify Template File on HuggingFace
1. Go to https://huggingface.co/spaces/spatiallity/tenderhub-api/tree/main
2. Check if `TEMPLATE_CV_EXPERT.docx` exists in root or `backend/` folder
3. If missing, upload it

### Step 7: Check Environment Variables
HuggingFace Space needs these env vars:
```
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

## Quick Fix: Use Local Backend
If HuggingFace is problematic, run backend locally:

1. **Start local backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Update frontend/.env:**
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Verification
After fix, test:
1. Open expert detail
2. Click "Generate CV"
3. Should download DOCX file
4. Check console for `[Generate CV] Blob size: ...`

## Current Status
- ✅ Backend health check works: https://spatiallity-tenderhub-api.hf.space/api/health
- ✅ Experts endpoint works: https://spatiallity-tenderhub-api.hf.space/api/v1/experts
- ❌ CV endpoint 404: https://spatiallity-tenderhub-api.hf.space/api/v1/cv/1/cv

## Next Steps
1. Run `supabase/fix_rls_and_errors.sql` to fix database issues
2. Verify CV endpoint exists on HuggingFace
3. Redeploy if needed
4. Test Generate CV again
