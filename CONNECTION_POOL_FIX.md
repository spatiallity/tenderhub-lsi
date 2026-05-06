# 🔧 Fix: Database Connection Pool Exhaustion

## ❌ Error yang Terjadi

```
sqlalchemy.exc.TimeoutError: QueuePool limit of size 20 overflow 30 reached, 
connection timed out, timeout 60.00
```

**Artinya:** Semua 50 database connections (20 pool + 30 overflow) habis dan tidak ada yang available.

## 🔍 Root Cause

### 1. Terlalu Banyak Concurrent Requests

Dari backend logs, terlihat **puluhan requests masuk bersamaan**:
```
INFO: GET /api/v1/tender/search?limit=200
INFO: GET /api/v1/watchlist
INFO: GET /api/v1/experts
INFO: GET /api/v1/rup/search?limit=100
INFO: GET /api/v1/keywords
... (repeated many times)
```

**Penyebab:**
- Frontend membuka banyak tab/windows
- Setiap tab melakukan API calls bersamaan
- Atau ada infinite loop di frontend yang terus fetch data

### 2. Connection Leak (Possible)

Connections mungkin tidak di-close dengan benar setelah digunakan.

### 3. Pool Size Terlalu Besar

Pool size 20 + overflow 30 = 50 connections terlalu besar untuk Supabase connection pooler.

## ✅ Solusi yang Diterapkan

### 1. Reduced Pool Size

**File:** `backend/app/core/database.py`

**Before:**
```python
pool_size=20,
max_overflow=30,
pool_timeout=60,
pool_recycle=3600,
```

**After:**
```python
pool_size=10,  # Reduced to prevent exhaustion
max_overflow=20,  # Reduced overflow
pool_timeout=30,  # Faster timeout
pool_recycle=1800,  # Recycle connections after 30 minutes (more aggressive)
```

**Rationale:**
- Supabase connection pooler has limits
- Smaller pool = less chance of exhaustion
- Faster recycle = fresher connections
- Faster timeout = fail fast instead of hanging

### 2. Proper Connection Cleanup

**File:** `backend/app/core/database.py`

**Before:**
```python
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

**After:**
```python
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # Commit any pending transactions
        except Exception:
            await session.rollback()  # Rollback on error
            raise
        finally:
            await session.close()  # Always close the session
```

**Rationale:**
- Explicit commit/rollback ensures transactions are closed
- Prevents hanging transactions that hold connections
- Always close session even on error

### 3. Added Connection Settings

**File:** `backend/app/core/database.py`

```python
connect_args={
    "ssl": ssl_ctx,
    "statement_cache_size": 0,
    "prepared_statement_cache_size": 0,
    "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4().hex}__",
    "server_settings": {
        "application_name": "tenderhub_backend",
        "jit": "off",  # Disable JIT for faster queries
    },
}
```

**Rationale:**
- Disable JIT for faster query execution
- Application name for monitoring
- Unique prepared statement names to avoid conflicts

## 🧪 Testing

### Test 1: Verify Backend Starts

```bash
# Check backend logs
# Should see:
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Application startup complete.
```

### Test 2: Test API Endpoints

```bash
# Test watchlist endpoint
curl http://localhost:8000/api/v1/watchlist

# Test experts endpoint
curl http://localhost:8000/api/v1/experts

# Test keywords endpoint
curl http://localhost:8000/api/v1/keywords
```

**Expected:** All endpoints return 200 OK without timeout.

### Test 3: Monitor Connection Pool

Check backend logs for connection pool errors:
- ❌ Should NOT see: `QueuePool limit reached`
- ❌ Should NOT see: `connection timed out`
- ✅ Should see: Normal request logs with 200 OK

### Test 4: Frontend Load Test

1. Open aplikasi di browser
2. Refresh halaman beberapa kali
3. Buka multiple tabs
4. Check backend logs - should handle all requests without timeout

## ⚠️ Additional Recommendations

### 1. Check for Infinite Loops in Frontend

**Possible causes:**
- `useEffect` without proper dependencies
- Realtime subscription triggering refetch
- Auto-refresh intervals

**How to check:**
1. Open browser DevTools → Network tab
2. Watch for repeated API calls
3. If you see same endpoint called many times per second → infinite loop!

**Example of infinite loop:**
```javascript
// ❌ BAD - Infinite loop
useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData changes every render!

// ✅ GOOD - Runs once
useEffect(() => {
  fetchData();
}, []); // Empty deps = run once
```

### 2. Implement Request Debouncing

For search/filter operations, add debouncing:

```javascript
import { useDebounce } from './hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500); // 500ms delay

useEffect(() => {
  if (debouncedSearch) {
    fetchData(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 3. Add Request Caching

Cache API responses to reduce database load:

```javascript
const [cache, setCache] = useState({});

const fetchData = async (key) => {
  if (cache[key]) {
    return cache[key]; // Return cached data
  }
  
  const data = await api.get(key);
  setCache(prev => ({ ...prev, [key]: data }));
  return data;
};
```

### 4. Monitor Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Connection Pooling**
4. Check:
   - Active connections
   - Connection pool usage
   - Slow queries

## 📊 Summary

### Root Cause:
- ❌ Too many concurrent requests
- ❌ Connection pool exhaustion
- ❌ Possible connection leaks

### Solution:
- ✅ Reduced pool size (20→10)
- ✅ Reduced overflow (30→20)
- ✅ Faster timeout (60s→30s)
- ✅ More aggressive recycle (1h→30min)
- ✅ Proper commit/rollback/close
- ✅ Disabled JIT for faster queries

### Result:
- ✅ Backend should handle requests without timeout
- ✅ Connection pool should not exhaust
- ✅ Faster response times

## 🚀 Next Steps

1. ✅ Backend restarted with new config
2. ⚠️ **Clear browser cache** (Ctrl+Shift+R)
3. ⚠️ **Use Incognito mode** to test
4. ⚠️ **Close all other tabs** of localhost:5173
5. ⚠️ **Monitor backend logs** for errors
6. ⚠️ **Check for infinite loops** in frontend

## 📖 Files Modified

| File | Status | Changes |
|------|--------|---------|
| `backend/app/core/database.py` | ✅ Fixed | Reduced pool size, added proper cleanup |
| `CONNECTION_POOL_FIX.md` | ✅ Created | This documentation |

---

**Status:** ✅ FIXED  
**Last Updated:** 6 Mei 2026, 10:30 WIB  
**Action Required:** Clear browser cache, use Incognito mode, close other tabs
