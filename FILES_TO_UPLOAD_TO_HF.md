# Files to Upload to HuggingFace Space

## Problem
CV Generation endpoint returns 404 because HuggingFace Space doesn't have the CV generator code.

## Files to Upload

Upload these files to https://huggingface.co/spaces/spatiallity/tenderhub-api

### 1. backend/app/main.py
**Location in HF:** `backend/app/main.py`
**Why:** Contains router registration for CV generator
**Check for this line:**
```python
from app.api.v1 import cv_generator_dynamic as cv_generator
app.include_router(cv_generator.router, prefix="/api/v1/cv", tags=["CV Generator"])
```

### 2. backend/app/api/v1/cv_generator_dynamic.py
**Location in HF:** `backend/app/api/v1/cv_generator_dynamic.py`
**Why:** Contains the CV generation endpoint logic
**Check for this line:**
```python
@router.get("/{expert_id}/cv")
async def generate_expert_cv_dynamic(expert_id: int, db: AsyncSession = Depends(get_db)):
```

### 3. backend/TEMPLATE_CV_EXPERT.docx
**Location in HF:** `backend/TEMPLATE_CV_EXPERT.docx` or `TEMPLATE_CV_EXPERT.docx`
**Why:** Template file needed for CV generation
**Note:** This is a binary file (DOCX)

## Upload Steps

1. Go to: https://huggingface.co/spaces/spatiallity/tenderhub-api
2. Click "Files" tab
3. For each file:
   - Click "Add file" → "Upload files"
   - Select the file from your local repo
   - Make sure the path matches (e.g., `backend/app/main.py`)
4. Click "Commit changes to main"
5. Wait for Space to rebuild (watch the status indicator)
6. Test endpoint: https://spatiallity-tenderhub-api.hf.space/api/v1/cv/1/cv

## Verification

After upload and rebuild:

1. **Check health:**
   ```
   https://spatiallity-tenderhub-api.hf.space/api/health
   ```
   Should return: `{"status":"ok","mode":"production"}`

2. **Check experts:**
   ```
   https://spatiallity-tenderhub-api.hf.space/api/v1/experts
   ```
   Should return: JSON array of experts

3. **Test CV generation:**
   ```
   https://spatiallity-tenderhub-api.hf.space/api/v1/cv/1/cv
   ```
   Should: Download DOCX file or return error if expert 1 doesn't exist

4. **Check logs:**
   - Go to Space → "Logs" tab
   - Look for: "Application startup complete"
   - Look for: Router registration messages

## Alternative: Use Git LFS

If manual upload doesn't work for DOCX file:

1. Install Git LFS:
   ```bash
   git lfs install
   ```

2. Track DOCX files:
   ```bash
   git lfs track "*.docx"
   ```

3. Add and commit:
   ```bash
   git add .gitattributes
   git add backend/TEMPLATE_CV_EXPERT.docx
   git commit -m "Add CV template with Git LFS"
   ```

4. Push to HF:
   ```bash
   git push hf main
   ```

## Current Status
- ✅ Backend code exists in local repo
- ✅ Endpoint works in local testing
- ❌ HuggingFace Space missing CV generator code
- ❌ Need manual upload to fix

## After Fix
Once files are uploaded and Space rebuilds:
- CV generation should work
- No more 404 errors
- DOCX files will download successfully
