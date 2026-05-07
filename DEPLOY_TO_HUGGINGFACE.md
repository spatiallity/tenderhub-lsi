# Deploy Backend to HuggingFace Space

## Current Issue
CV Generation endpoint returns 404 because HuggingFace Space doesn't have the latest backend code.

## Solution: Push Latest Code to HuggingFace

### Method 1: Using Git (Recommended)

1. **Add HuggingFace remote (if not exists):**
   ```bash
   git remote add hf https://huggingface.co/spaces/spatiallity/tenderhub-api
   ```

2. **Check current remotes:**
   ```bash
   git remote -v
   ```
   Should show:
   ```
   origin  https://github.com/spatiallity/tenderhub-lsi.git
   hf      https://huggingface.co/spaces/spatiallity/tenderhub-api
   ```

3. **Push to HuggingFace:**
   ```bash
   git push hf main --force
   ```

4. **Wait for rebuild:**
   - Go to https://huggingface.co/spaces/spatiallity/tenderhub-api
   - Wait for "Building" to finish
   - Status should turn green "Running"

5. **Verify deployment:**
   - Open: https://spatiallity-tenderhub-api.hf.space/api/health
   - Should return: `{"status":"ok","mode":"production"}`
   - Test CV endpoint: https://spatiallity-tenderhub-api.hf.space/api/v1/cv/1/cv

### Method 2: Manual Upload via Web UI

1. **Go to HuggingFace Space:**
   https://huggingface.co/spaces/spatiallity/tenderhub-api

2. **Click "Files" tab**

3. **Upload these files:**
   - `backend/app/api/v1/cv_generator_dynamic.py`
   - `backend/app/main.py`
   - `backend/TEMPLATE_CV_EXPERT.docx`
   - `backend/requirements.txt`

4. **Click "Commit changes"**

5. **Wait for rebuild**

### Method 3: Factory Reboot (If code is already there)

1. **Go to Space Settings:**
   https://huggingface.co/spaces/spatiallity/tenderhub-api/settings

2. **Scroll to "Factory reboot"**

3. **Click "Factory reboot"**

4. **Wait for rebuild**

## Verification Steps

After deployment, test these endpoints:

1. **Health Check:**
   ```
   https://spatiallity-tenderhub-api.hf.space/api/health
   ```
   Expected: `{"status":"ok","mode":"production"}`

2. **Experts List:**
   ```
   https://spatiallity-tenderhub-api.hf.space/api/v1/experts
   ```
   Expected: JSON array of experts

3. **CV Generation:**
   ```
   https://spatiallity-tenderhub-api.hf.space/api/v1/cv/1/cv
   ```
   Expected: Download DOCX file (or error if expert 1 doesn't exist)

## Troubleshooting

### If push fails with authentication error:
```bash
# Use HuggingFace token
git remote set-url hf https://YOUR_USERNAME:YOUR_HF_TOKEN@huggingface.co/spaces/spatiallity/tenderhub-api
```

Get token from: https://huggingface.co/settings/tokens

### If Space shows "Runtime Error":
1. Check Logs tab in HuggingFace Space
2. Look for Python errors
3. Common issues:
   - Missing dependencies in requirements.txt
   - Missing environment variables
   - Missing TEMPLATE_CV_EXPERT.docx file

### If CV endpoint still 404:
1. Check that `backend/app/main.py` has:
   ```python
   from app.api.v1 import cv_generator_dynamic as cv_generator
   app.include_router(cv_generator.router, prefix="/api/v1/cv", tags=["CV Generator"])
   ```

2. Check that `backend/TEMPLATE_CV_EXPERT.docx` exists

3. Check Space logs for startup errors

## Environment Variables on HuggingFace

Make sure these are set in Space Settings → Variables:

```
DATABASE_URL=postgresql+asyncpg://postgres.aedojcjkhorogsgwasab:TenderHub2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://aedojcjkhorogsgwasab.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
USE_DUMMY_DATA=false
SKIP_AUTH=true
```

## After Successful Deployment

1. Restart frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Test Generate CV in browser

3. Should download DOCX file successfully

## Quick Command Reference

```bash
# Add HF remote
git remote add hf https://huggingface.co/spaces/spatiallity/tenderhub-api

# Push to HF
git push hf main --force

# Check HF Space status
curl https://spatiallity-tenderhub-api.hf.space/api/health

# Test CV endpoint
curl -I https://spatiallity-tenderhub-api.hf.space/api/v1/cv/1/cv
```
