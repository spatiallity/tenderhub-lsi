# 🚨 Production Error Fix - Hugging Face Deployment

## ❌ Errors yang Terjadi

### 1. **500 Internal Server Error**
```
Failed to load resource: the server responded with a status of 500
- /api/v1/rup/search
- /api/v1/tender/search
```

### 2. **405 Method Not Allowed**
```
Failed to load resource: the server responded with a status of 405
- PATCH /api/v1/watchlist/1
```

---

## 🔍 Root Cause Analysis

### Error 500: Database Connection atau INAPROC API Issue

**Penyebab Kemungkinan**:
1. ❌ Environment variables tidak ter-set di Hugging Face Spaces
2. ❌ Database connection timeout
3. ❌ INAPROC API down atau rate limited
4. ❌ Async operation timeout

**Bukti dari logs**:
- `/keywords` endpoint berhasil (200) → Backend running ✅
- `/experts` endpoint berhasil (200) → Database connection OK ✅
- `/tender/search` dan `/rup/search` gagal (500) → INAPROC API call error ❌

**Kesimpulan**: Kemungkinan besar **INAPROC API** yang bermasalah, bukan database.

### Error 405: PATCH Method Not Allowed

**Penyebab**: Backend endpoint `PATCH /watchlist/{kd_tender}` mungkin tidak ter-register dengan benar di Hugging Face, atau ada konflik routing.

---

## ✅ Solutions

### SOLUTION 1: Check Hugging Face Logs

**Step 1: Buka Hugging Face Logs**

1. Buka: https://huggingface.co/spaces/spatiallity/tenderhub-api
2. Klik tab **Logs** (di bawah)
3. Scroll ke bawah untuk lihat error messages

**Look for**:
- `ConnectionError` → Database issue
- `TimeoutError` → INAPROC API timeout
- `404` atau `Connection refused` → INAPROC API down
- `AttributeError` atau `KeyError` → Code bug

---

### SOLUTION 2: Fix Environment Variables

**Step 1: Check Hugging Face Spaces Settings**

1. Buka: https://huggingface.co/spaces/spatiallity/tenderhub-api/settings
2. Scroll ke **Repository secrets**
3. Pastikan ada environment variables berikut:

```bash
DATABASE_URL=postgresql+asyncpg://postgres.aedojcjkhorogsgwasab:TenderHub2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres

SUPABASE_URL=https://aedojcjkhorogsgwasab.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SKIP_AUTH=true
USE_DUMMY_DATA=false

CORS_ORIGINS=https://spatiallity-tenderhub-api.hf.space,http://localhost:5173
```

**Step 2: Restart Hugging Face Space**

1. Klik **Factory reboot** di settings
2. Atau push dummy commit untuk trigger rebuild:
   ```bash
   git commit --allow-empty -m "Trigger Hugging Face rebuild"
   git push origin main
   ```

---

### SOLUTION 3: Fix PATCH Endpoint (405 Error)

Backend endpoint menggunakan `kd_tender` sebagai path parameter, tapi mungkin ada konflik.

**Option A: Ubah Backend - Gunakan POST untuk Update**

Modify `backend/app/api/v1/watchlist.py`:

```python
@router.post("/upsert", response_model=WatchlistOut)
async def upsert_watchlist(item_in: WatchlistCreate, db: AsyncSession = Depends(get_db)):
    """Upsert watchlist entry by kd_tender"""
    # Check if exists
    result = await db.execute(select(TenderWatchlist).where(TenderWatchlist.kd_tender == item_in.kd_tender))
    existing = result.scalars().first()
    
    if existing:
        # Update existing
        update_data = item_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing, key, value)
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        # Create new
        item = TenderWatchlist(**item_in.model_dump())
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item
```

**Option B: Ubah Frontend - Gunakan POST**

Modify `frontend/src/store/AppContext.jsx`:

```javascript
// Find upsertWatchlistEntry function
// Change from:
await api.patch(`/watchlist/${tenderId}`, data)

// To:
await api.post('/watchlist/upsert', {
  kd_tender: tenderId,
  ...data
})
```

---

### SOLUTION 4: Add Fallback untuk INAPROC API

Jika INAPROC API down, gunakan dummy data.

Modify `backend/app/services/inaproc.py`:

```python
async def get_tenders(self, params):
    try:
        # Try real API
        response = await self.session.get(...)
        return response.json()
    except Exception as e:
        print(f"⚠️ INAPROC API error: {e}, using fallback")
        # Return dummy data
        from app.services.dummy_data import DUMMY_TENDERS
        return DUMMY_TENDERS[:params.get('limit', 100)]
```

---

## 🎯 Quick Fix Steps (DO THIS FIRST)

### Step 1: Check Hugging Face Logs

```bash
# Buka browser
https://huggingface.co/spaces/spatiallity/tenderhub-api

# Klik tab "Logs"
# Screenshot error message dan kirim ke sini
```

### Step 2: Test INAPROC API Manually

```bash
# Test dari terminal
curl "https://isb.lkpp.go.id/isb-2/api/satudata/TenderSatuSatker/get?tahun=2025&limit=10"
```

Jika return error atau timeout → INAPROC API down

### Step 3: Temporary Fix - Use Dummy Data

Edit `backend/.env` di Hugging Face:

```bash
USE_DUMMY_DATA=true
```

Restart space. Ini akan bypass INAPROC API dan gunakan dummy data.

---

## 📋 Diagnostic Checklist

- [ ] Check Hugging Face logs untuk error message
- [ ] Test INAPROC API dari browser/curl
- [ ] Verify environment variables di Hugging Face settings
- [ ] Check Supabase connection dari local
- [ ] Test backend endpoints dari local
- [ ] Compare local vs production behavior

---

## 🚀 Recommended Action Plan

### Immediate (5 minutes):

1. **Check Hugging Face logs** → Identify exact error
2. **Test INAPROC API** → See if it's down
3. **Enable USE_DUMMY_DATA=true** → Temporary workaround

### Short-term (30 minutes):

1. **Fix PATCH endpoint** → Use POST /upsert instead
2. **Add error handling** → Fallback to dummy data if API fails
3. **Add retry logic** → Retry INAPROC API calls with exponential backoff

### Long-term (1-2 hours):

1. **Implement caching** → Cache INAPROC responses for 5-10 minutes
2. **Add monitoring** → Log all API errors to Supabase
3. **Setup health check** → Ping INAPROC API every 5 minutes

---

## 📞 Next Steps

**Kirim ke sini**:
1. Screenshot Hugging Face logs (tab "Logs")
2. Result dari `curl` test INAPROC API
3. Screenshot Hugging Face environment variables (blur sensitive data)

Dengan info ini, saya bisa kasih solusi yang lebih spesifik.

---

**Timestamp**: 2026-05-06  
**Status**: Investigating  
**Priority**: HIGH (Production down)
