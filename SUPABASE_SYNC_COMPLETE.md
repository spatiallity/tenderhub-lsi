# Sinkronisasi Data Lengkap dengan Supabase

## 📊 Overview

Semua data aplikasi TenderHub sekarang tersinkron dengan Supabase PostgreSQL database untuk:
- ✅ **Persistensi data** - Data tidak hilang saat refresh browser
- ✅ **Real-time collaboration** - Perubahan dari user lain langsung terlihat
- ✅ **Multi-device access** - Data sama di semua device
- ✅ **Backup otomatis** - Data aman di cloud

## 🗄️ Tabel Database

### 1. **experts** - Data Tenaga Ahli
```sql
- id (primary key)
- nama, no_hp, instansi
- jenis_instansi (internal/eksternal)
- keahlian (JSON array)
- subporto (JSON array)
- main_keahlian
- availability (Tersedia/Sedang Bertugas/Tidak Tersedia)
- rating_avg, jumlah_proyek
- created_at, updated_at
```

**Relasi:**
- `expert_projects` - Riwayat proyek tenaga ahli
- `expert_reviews` - Review dari klien/PM

### 2. **keywords** - Keyword Matching
```sql
- id (primary key)
- keyword_text (text keyword)
- subporto (FLP/SDA/FITI)
- is_active (boolean)
- created_at
```

### 3. **tender_watchlist** - Tracking Tender
```sql
- id (primary key)
- kd_tender (ID tender dari INAPROC)
- nama_paket, nama_klpd, hps
- status_internal (Dipantau/Akan Diikuti/Sudah Diikuti/Menang/Kalah/Tidak Relevan)
- catatan_internal (JSON notes)
- assigned_pic (user ID)
- assigned_expert_ids (JSON array)
- subporto_rekomendasi
- relevance_score
- created_at, updated_at
```

**Real-time enabled** ✅ - Perubahan langsung tersinkron

### 4. **tender_cache** - Cache Data INAPROC
```sql
- id (primary key)
- kd_tender (unique)
- raw_data (JSON)
- tahapan_data (JSON)
- last_fetched_at, expires_at
```

### 5. **profiles** - User Management
```sql
- id (UUID, references auth.users)
- email, name, title
- role (admin/manager/user)
- is_active
- created_at, updated_at
```

## 🔄 Data Flow

### Experts
```
Frontend (AppContext)
    ↓ GET /api/v1/experts
Backend (FastAPI)
    ↓ SQLAlchemy
Supabase (PostgreSQL)
    ↓ Real-time (optional)
Frontend (auto-update)
```

**Operations:**
- ✅ Load: `GET /experts` → Load saat app start
- ✅ Create: `POST /experts` → Optimistic update + sync
- ✅ Update: `PATCH /experts/{id}` → Optimistic update + sync
- ✅ Delete: `DELETE /experts/{id}` → Optimistic update + sync
- ✅ Add Project: `POST /experts/{id}/projects`
- ✅ Add Review: `POST /experts/{id}/reviews`

### Keywords
```
Frontend (AppContext)
    ↓ GET /api/v1/keywords
Backend (FastAPI)
    ↓ SQLAlchemy
Supabase (PostgreSQL)
    ↓ Real-time (optional)
Frontend (auto-update)
```

**Operations:**
- ✅ Load: `GET /keywords` → Transform ke format grouped
- ✅ Add: `POST /keywords` → Optimistic update + sync
- ✅ Update: `PUT /keywords/{id}` → Optimistic update + sync
- ✅ Delete: `DELETE /keywords/{id}` → Optimistic update + sync
- ✅ Clear All: Batch delete semua keywords

### Tender Watchlist
```
Frontend (AppContext)
    ↓ GET /api/v1/watchlist
Backend (FastAPI)
    ↓ SQLAlchemy
Supabase (PostgreSQL)
    ↓ Real-time ✅
Frontend (useWatchlistRealtime)
```

**Operations:**
- ✅ Load: `GET /watchlist` → Load saat app start
- ✅ Update Status: `PATCH /watchlist/{kd_tender}` → Optimistic + real-time sync
- ✅ Update PIC: `PATCH /watchlist/{kd_tender}` → Optimistic + real-time sync
- ✅ Add Note: `PATCH /watchlist/{kd_tender}` → Optimistic + real-time sync
- ✅ Real-time: Echo prevention untuk avoid override

## 🚀 Setup Instructions

### 1. Run SQL Setup di Supabase Dashboard

Buka **Supabase Dashboard > SQL Editor** dan jalankan file-file ini secara berurutan:

```bash
1. supabase/auth_setup.sql          # User authentication & profiles
2. supabase/complete_setup.sql      # All tables (experts, keywords, watchlist, cache)
```

### 2. Verify Tables Created

Di Supabase Dashboard > Table Editor, pastikan tabel-tabel ini ada:
- ✅ profiles
- ✅ experts
- ✅ expert_projects
- ✅ expert_reviews
- ✅ keywords
- ✅ tender_watchlist
- ✅ tender_cache

### 3. Enable Realtime (Optional)

Di Supabase Dashboard > Database > Replication:
- ✅ Enable untuk `tender_watchlist` (sudah di-enable via SQL)
- ✅ Enable untuk `experts` (optional)
- ✅ Enable untuk `keywords` (optional)

### 4. Verify Backend Connection

Check `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. Test Connection

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Test endpoints
curl http://localhost:8000/api/v1/experts
curl http://localhost:8000/api/v1/keywords
curl http://localhost:8000/api/v1/watchlist
```

## 📝 Frontend Implementation

### AppContext.jsx

**Load Data on Mount:**
```javascript
useEffect(() => {
  // Load keywords from Supabase
  api.get('/keywords').then(res => {
    const grouped = { FLP: [], SDA: [], FITI: [] };
    res.data.forEach(kw => {
      grouped[kw.subporto].push({
        id: `${kw.subporto}-${kw.id}`,
        dbId: kw.id,
        text: kw.keyword_text,
        active: kw.is_active
      });
    });
    setKeywords(grouped);
  });
}, []);
```

**Optimistic Updates:**
```javascript
const addKeyword = async (portfolio, text) => {
  // 1. Update UI immediately (optimistic)
  setKeywords(prev => ({
    ...prev,
    [portfolio]: [...prev[portfolio], { id: tempId, text, active: true }]
  }));
  
  // 2. Sync to database
  const res = await api.post('/keywords', {
    keyword_text: text,
    subporto: portfolio,
    is_active: true
  });
  
  // 3. Update with real database ID
  setKeywords(prev => ({
    ...prev,
    [portfolio]: prev[portfolio].map(k => 
      k.id === tempId ? { ...k, dbId: res.data.id } : k
    )
  }));
};
```

### useWatchlistRealtime.js

**Real-time Sync dengan Echo Prevention:**
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('tender_watchlist_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'tender_watchlist' 
    }, (payload) => {
      // Skip if this is our own update (within 3 seconds)
      if (isOwnUpdate(payload.new.kd_tender)) return;
      
      // Update only changed fields
      setInternalStatuses(prev => ({
        ...prev,
        [payload.new.kd_tender]: payload.new.status_internal
      }));
    })
    .subscribe();
}, []);
```

## 🔒 Security (Row Level Security)

Semua tabel sudah dilindungi dengan RLS:

```sql
-- Example: Only authenticated users can access
CREATE POLICY "Experts are readable by authenticated users"
  ON public.experts FOR SELECT TO authenticated USING (TRUE);
```

**Policies Applied:**
- ✅ SELECT - Authenticated users can read
- ✅ INSERT - Authenticated users can create
- ✅ UPDATE - Authenticated users can update
- ✅ DELETE - Authenticated users can delete

## 🧪 Testing

### Test 1: Keyword Sync
1. Tambah keyword di browser A
2. Refresh browser B
3. ✅ Keyword harus muncul di browser B

### Test 2: Expert Sync
1. Tambah tenaga ahli di browser A
2. Refresh browser B
3. ✅ Tenaga ahli harus muncul di browser B

### Test 3: Watchlist Real-time
1. Ubah status tender di browser A
2. Browser B harus auto-update (tanpa refresh)
3. ✅ Status berubah di browser B dalam 1-2 detik

### Test 4: Echo Prevention
1. Ubah status tender
2. Check console log
3. ✅ Harus muncul: `[Realtime] Skipping echo for tender X`

## 📊 Data Migration (Optional)

Jika ada data lama di localStorage/dummy:

```javascript
// Migrate keywords to Supabase
const migrateKeywords = async () => {
  const oldKeywords = DEFAULT_KEYWORDS;
  for (const [portfolio, keywords] of Object.entries(oldKeywords)) {
    for (const kw of keywords) {
      await api.post('/keywords', {
        keyword_text: kw.text,
        subporto: portfolio,
        is_active: kw.active
      });
    }
  }
};
```

## 🎯 Benefits

### Before (localStorage/memory)
- ❌ Data hilang saat refresh
- ❌ Tidak bisa kolaborasi
- ❌ Tidak ada backup
- ❌ Tidak bisa multi-device

### After (Supabase)
- ✅ Data persisten
- ✅ Real-time collaboration
- ✅ Auto backup
- ✅ Multi-device sync
- ✅ Scalable
- ✅ Secure (RLS)

## 🔧 Troubleshooting

### Data tidak muncul
```bash
# Check backend logs
cd backend
uvicorn app.main:app --reload

# Check database connection
# Pastikan DATABASE_URL benar di .env
```

### Real-time tidak bekerja
```bash
# Check Supabase Dashboard > Database > Replication
# Pastikan tender_watchlist enabled

# Check browser console
# Harus ada log: [Realtime] Processing INSERT/UPDATE
```

### Duplicate data
```bash
# Run cleanup script
# supabase/cleanup_duplicate_experts.sql
```

## 📚 References

- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI + SQLAlchemy](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
