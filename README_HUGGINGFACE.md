# 🚀 Hugging Face Deployment Guide

## Current Status

Backend API deployed at: https://spatiallity-tenderhub-api.hf.space

## Environment Variables

The following environment variables are configured in `.env.production`:

```bash
DATABASE_URL=postgresql+asyncpg://postgres.aedojcjkhorogsgwasab:TenderHub2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://aedojcjkhorogsgwasab.supabase.co
USE_DUMMY_DATA=true
SKIP_AUTH=true
CORS_ORIGINS=https://spatiallity-tenderhub-api.hf.space,http://localhost:5173
```

## How Hugging Face Reads Environment Variables

Hugging Face Spaces can read environment variables from:

1. **Repository Secrets** (in Hugging Face Settings) - Most secure
2. **`.env` file** in repository root - Automatically loaded
3. **Dockerfile ENV** - Hardcoded in Dockerfile

Currently using `.env.production` which will be copied during build.

## Deployment Process

1. Push code to GitHub
2. Hugging Face auto-syncs from GitHub (if sync is enabled)
3. Hugging Face builds Docker image
4. Backend starts on port 7860

## Troubleshooting

### Error 500 on /tender/search or /rup/search

**Cause**: Backend can't connect to database or INAPROC API

**Solution**:
1. Check Hugging Face logs: https://huggingface.co/spaces/spatiallity/tenderhub-api
2. Verify `USE_DUMMY_DATA=true` is set
3. Check if database connection string is correct

### Backend not starting

**Cause**: Missing dependencies or Python version mismatch

**Solution**:
1. Check `backend/requirements.txt` has all dependencies
2. Verify Python version in Dockerfile (currently 3.11)
3. Check Hugging Face build logs

### CORS errors

**Cause**: Frontend domain not in CORS_ORIGINS

**Solution**:
Add frontend domain to `CORS_ORIGINS` in `.env.production`:
```bash
CORS_ORIGINS=https://spatiallity-tenderhub-api.hf.space,https://your-frontend-domain.com
```

## Manual Environment Variable Setup (Alternative)

If `.env.production` doesn't work, set variables manually in Hugging Face:

1. Go to: https://huggingface.co/spaces/spatiallity/tenderhub-api/settings
2. Scroll to **Repository secrets**
3. Add each variable:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `USE_DUMMY_DATA`
   - `SKIP_AUTH`
   - `CORS_ORIGINS`

## Testing

Test backend health:
```bash
curl https://spatiallity-tenderhub-api.hf.space/api/health
```

Expected response:
```json
{"status": "ok", "mode": "dummy"}
```

Test tender endpoint:
```bash
curl https://spatiallity-tenderhub-api.hf.space/api/v1/tender/search?limit=10
```

Should return array of tenders (dummy data).

## Current Configuration

- ✅ Dockerfile configured for Hugging Face (port 7860)
- ✅ `.env.production` with all required variables
- ✅ `USE_DUMMY_DATA=true` (no INAPROC API needed)
- ✅ `SKIP_AUTH=true` (no authentication required)
- ✅ CORS configured for Hugging Face domain
- ✅ Database connection to Supabase

## Next Steps

1. Push `.env.production` to repository
2. Wait for Hugging Face to rebuild (5-10 minutes)
3. Check logs at https://huggingface.co/spaces/spatiallity/tenderhub-api
4. Test endpoints

## Support

If still having issues:
1. Check Hugging Face logs
2. Verify all environment variables are set
3. Test database connection from Hugging Face
4. Check if dummy data is being loaded
