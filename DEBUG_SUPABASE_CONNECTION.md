# Debug Supabase Connection

## ✅ Status Koneksi

### Backend → Supabase
**STATUS: ✅ CONNECTED**

Test:
```bash
curl http://localhost:8000/api/v1/watchlist
```

Result: ✅ Returns 4 items from database

### Frontend → Backend
**STATUS: ⚠️ NEEDS TESTING**

## 🔍 Debugging Steps

### Step 1: Buka Browser Console (F12)

1. Buka http://localhost:5173/
2. Tekan F12
3. Pilih tab **Console**
4. Refresh halaman (Ctrl+R)

**Yang harus muncul:**
```
[AppContext] Loading keywords from Supabase...
[API] GET /keywords
[API] Response from /keywords: 200 [...]
[AppContext] Keywords loaded: [...]

[AppContext] Loading tenders and watchlist...
[API] GET /tender/search?limit=200
[API] Response from /tender/search: 200 [...]
[AppContext] Tenders loaded: 200 items

[AppContext] Loading watchlist from backend...
[API] GET /watchlist
[API] Response from /watchlist: 200 [...]
[AppContext] Watchlist loaded: 4 items
```

**Jika TIDAK muncul log di atas:**
- ❌ Frontend tidak memanggil API
- Check: Apakah ada error di console?
- Check: Apakah `frontend/.env` sudah ada?

### Step 2: Test Update Status

1. Pilih tender dengan ID 169154 (Survei Topografi)
2. Ubah status dari "Dipantau" ke "Akan Diikuti"
3. Klik tombol **"Simpan"**

**Yang harus muncul di Console:**
```
[updateTenderStatus] Called for tender 169154, new status: Akan Diikuti
[updateTenderStatus] Optimistic update - setting status to: Akan Diikuti
[upsertWatchlistEntry] Upserting tender 169154: {status_internal: "Akan Diikuti"}
[upsertWatchlistEntry] Trying PATCH /watchlist/169154
[API] PATCH /watchlist/169154 {status_internal: "Akan Diikuti"}
[API] Response from /watchlist/169154: 200 {...}
[upsertWatchlistEntry] PATCH successful: {...}
[updateTenderStatus] Success!
```

**Jika muncul error:**
- Check error message di console
- Check Network tab (F12 > Network) untuk melihat request/response

### Step 3: Verify di Database

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Table Editor** > **tender_watchlist**
4. Cari row dengan `kd_tender = 169154`
5. Check kolom `status_internal` → harus "Akan Diikuti"

## 🐛 Common Issues

### Issue 1: "Network Error" atau "timeout"

**Penyebab:** Backend tidak running atau CORS issue

**Solusi:**
```bash
# Check backend running
curl http://localhost:8000/api/v1/watchlist

# Jika tidak ada response, restart backend:
cd backend
uvicorn app.main:app --reload
```

### Issue 2: "404 Not Found" saat PATCH

**Penyebab:** Entry belum ada di watchlist

**Solusi:** Otomatis akan create entry baru dengan POST

**Check Console:**
```
[upsertWatchlistEntry] Entry not found, creating with POST
[API] POST /watchlist {...}
[upsertWatchlistEntry] POST successful: {...}
```

### Issue 3: Data tidak muncul setelah refresh

**Penyebab:** Data tidak tersimpan ke database

**Check:**
1. Console logs - apakah ada error?
2. Network tab - apakah request berhasil (status 200)?
3. Supabase Table Editor - apakah data ada di database?

### Issue 4: "User not authenticated"

**Penyebab:** Belum login atau mode guest

**Solusi:**
- Login dengan user yang valid
- Atau pastikan `SKIP_AUTH=true` di `backend/.env`

## 📊 Test Checklist

- [ ] Backend running (http://localhost:8000)
- [ ] Frontend running (http://localhost:5173)
- [ ] Browser console shows API logs
- [ ] GET /watchlist returns data
- [ ] PATCH /watchlist/{id} updates data
- [ ] Data persists after refresh
- [ ] Supabase Table Editor shows updated data

## 🔧 Manual Test

Buka file `test_frontend_api.html` di browser:
```bash
# Windows
start test_frontend_api.html

# Or open in browser manually
```

Click buttons:
1. **Test GET /watchlist** → Should show 4 items
2. **Test PATCH /watchlist/169154** → Should update status

## 📝 Current Database State

**tender_watchlist table:**
- ✅ 4 entries exist
- ✅ kd_tender: 1, 2, 3, 169154
- ✅ status_internal values: "Kalah", "Kalah", "Dipantau", "Kalah"

**Test tender:**
- kd_tender: 169154
- nama_paket: "Survei Topografi"
- status_internal: "Dipantau"
- assigned_pic: "1"

## 🎯 Expected Behavior

1. **Load data:**
   - Frontend calls GET /watchlist
   - Backend returns 4 items from Supabase
   - Frontend displays data

2. **Update status:**
   - User changes status
   - Frontend calls PATCH /watchlist/{id}
   - Backend updates Supabase
   - Frontend shows updated status
   - Refresh → status persists

3. **Real-time sync:**
   - User A updates status
   - User B sees update (within 1-2 seconds)
   - No page refresh needed

## 🚀 Next Steps

1. **Open browser console** (F12)
2. **Refresh page** (Ctrl+R)
3. **Check logs** - are API calls being made?
4. **Test update** - does it save to database?
5. **Report results** - what logs/errors do you see?
