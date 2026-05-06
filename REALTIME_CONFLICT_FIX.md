# Fix: Data Reverting Issue (Realtime Conflict)

## Problem Diagnosis

Data perubahan (status internal, catatan, PIC) **tersimpan sebentar lalu kembali ke kondisi awal**.

### Root Causes Found:

1. **❌ Frontend `.env` File Salah**
   - File `frontend/.env` berisi konfigurasi backend (DATABASE_URL, dll)
   - Seharusnya berisi `VITE_API_BASE_URL` dan `VITE_SUPABASE_*`
   - Menyebabkan API calls gagal atau menggunakan URL default

2. **❌ Realtime Subscription Conflict**
   - Supabase realtime subscription **menimpa perubahan lokal**
   - Flow yang terjadi:
     1. User ubah status → Optimistic update (state berubah)
     2. API call ke backend → Backend update database
     3. Database trigger realtime event
     4. **Realtime subscription menerima event dan overwrite state**
     5. Karena echo prevention window terlalu pendek (3 detik), perubahan lokal tertimpa
   
3. **❌ Echo Prevention Tidak Efektif**
   - Window 3 detik terlalu pendek untuk network latency
   - Realtime event bisa datang setelah 3 detik
   - Tidak ada logging untuk debug

## Solutions Applied

### 1. ✅ Fixed Frontend `.env`

**Before:**
```env
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://...
SKIP_AUTH=true
```

**After:**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://aedojcjkhorogsgwasab.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. ✅ Disabled Realtime in Development Mode

Modified `frontend/src/hooks/useWatchlistRealtime.js`:

```javascript
// DEVELOPMENT MODE: Disable realtime subscription to prevent conflicts
const isDevelopment = import.meta.env.DEV;
if (isDevelopment) {
  console.log('[Realtime] Development mode - realtime subscription DISABLED');
  return;
}
```

**Rationale:**
- Development mode = single user
- No need for multi-user realtime sync
- Prevents race conditions between optimistic updates and realtime events
- Production mode will still have realtime enabled

### 3. ✅ Improved Echo Prevention (for Production)

- Increased echo prevention window: 3s → 10s
- Added comprehensive logging
- Better tracking of local updates

## How to Test

### Step 1: Stop All Services
```bash
# Stop backend
cd backend
# Press Ctrl+C if running

# Stop frontend  
cd frontend
# Press Ctrl+C if running
```

### Step 2: Restart Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 3: Restart Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 4: Clear Browser Cache
**CRITICAL:** Browser mungkin masih cache kode lama!

1. **Hard Refresh:** `Ctrl + Shift + R` (Windows/Linux) atau `Cmd + Shift + R` (Mac)
2. **Clear Cache:** `Ctrl + Shift + Delete` → Clear cache
3. **Or use Incognito:** `Ctrl + Shift + N`

### Step 5: Test Data Persistence

1. **Open Browser Console** (`F12` → Console tab)
2. **Login** (auto-login in dev mode)
3. **Check Console Logs:**
   ```
   [Auth] Development mode - auto-login as dev user
   [Realtime] Development mode - realtime subscription DISABLED
   [AppContext] Loading tenders and watchlist...
   [API] GET /watchlist
   ```

4. **Change Tender Status:**
   - Pilih tender
   - Ubah status internal (Dipantau → Diikuti)
   - **Check Console:**
     ```
     [updateTenderStatus] Called for tender 123, new status: Diikuti
     [Realtime] Marked tender 123 as locally updated
     [API] PATCH /watchlist/123
     [API] Response from /watchlist/123: 200
     ```

5. **Verify Persistence:**
   - Refresh page (`F5`)
   - Status harus tetap "Diikuti"
   - **Check Console:**
     ```
     [AppContext] Loaded status for tender 123: Diikuti
     ```

6. **Test Notes:**
   - Tambah catatan internal
   - Refresh page
   - Catatan harus tetap ada

7. **Test PIC Assignment:**
   - Assign PIC ke tender
   - Refresh page
   - PIC harus tetap assigned

## Expected Console Output (Success)

```
[Auth] Development mode - auto-login as dev user
[Realtime] Development mode - realtime subscription DISABLED to prevent data conflicts
[AppContext] Loading keywords from Supabase...
[API] GET /keywords
[AppContext] Keywords loaded: 15 items
[AppContext] Loading tenders and watchlist...
[API] GET /tender/search?limit=200
[AppContext] Tenders loaded: 50 items
[API] GET /watchlist
[AppContext] Watchlist loaded: 4 items
[AppContext] Loaded status for tender 12345: Diikuti
[AppContext] Status map: 50 items
```

## Troubleshooting

### Issue: "Anda harus login untuk menyimpan perubahan"
**Solution:** Clear browser cache and hard refresh. Dev mode auto-login not working.

### Issue: Status masih revert setelah refresh
**Solution:** 
1. Check backend logs - apakah PATCH request berhasil?
2. Check Supabase dashboard - apakah data tersimpan?
3. Check console - apakah ada error dari API?

### Issue: "timeout of 3000ms exceeded"
**Solution:** Browser masih menggunakan kode lama. Clear cache dan hard refresh.

### Issue: Realtime masih aktif di development
**Solution:** 
1. Check console - harus ada log "realtime subscription DISABLED"
2. Jika tidak ada, restart frontend dengan `npm run dev`
3. Clear browser cache

## Files Modified

1. ✅ `frontend/.env` - Fixed environment variables
2. ✅ `frontend/src/hooks/useWatchlistRealtime.js` - Disabled in dev mode, improved echo prevention
3. ✅ `REALTIME_CONFLICT_FIX.md` - This documentation

## Production Deployment Notes

When deploying to production:

1. **Enable Realtime:** Realtime will automatically enable in production mode
2. **Set Environment Variables:**
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com/api/v1
   VITE_SUPABASE_URL=https://aedojcjkhorogsgwasab.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. **Test Multi-User Sync:** Realtime subscription will sync changes across multiple users
4. **Monitor Echo Prevention:** Check logs for echo prevention effectiveness

## Summary

✅ **Fixed frontend `.env`** - Now uses correct VITE_ prefixed variables
✅ **Disabled realtime in dev mode** - Prevents race conditions
✅ **Improved echo prevention** - 10s window + better logging
✅ **Added comprehensive logging** - Easy to debug issues

**Next Steps:**
1. Restart backend dan frontend
2. Clear browser cache
3. Test perubahan status, catatan, dan PIC
4. Verify data persist setelah refresh
