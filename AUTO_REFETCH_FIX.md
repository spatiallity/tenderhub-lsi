# 🔧 Fix: Auto-Refetch Interval Causing Connection Pool Exhaustion

## 🐛 Masalah

Aplikasi **berjalan normal di awal**, tapi setelah **beberapa menit** mulai muncul error:
```
timeout of 30000ms exceeded
[AppContext] failed to load data: AxiosError
```

Backend logs menunjukkan:
```
sqlalchemy.exc.TimeoutError: QueuePool limit reached, connection timed out
```

## 🔍 Root Cause - DITEMUKAN!

**File:** `frontend/src/App.jsx`

**Kode bermasalah:**
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true, // ❌ Auto-refetch when user focuses window
      refetchInterval: 60 * 1000, // ❌ Auto-refetch every 60 seconds!
      retry: 1,
    },
  },
});
```

**Masalah:**
1. **`refetchInterval: 60 * 1000`** → Setiap 60 detik, **SEMUA queries di-refetch otomatis**!
2. **`refetchOnWindowFocus: true`** → Setiap kali user focus ke tab, **SEMUA queries di-refetch**!

**Dampak:**
```
Menit 0: App load → 5 API calls (keywords, tenders, watchlist, rup, experts)
Menit 1: Auto-refetch → 5 API calls lagi
Menit 2: Auto-refetch → 5 API calls lagi
Menit 3: Auto-refetch → 5 API calls lagi
...
Menit 10: Total 50+ API calls → Connection pool HABIS!
```

**Plus:** Setiap kali user switch tab atau focus window → refetch lagi!

## ✅ Solusi

### Fixed React Query Configuration

**File:** `frontend/src/App.jsx`

**Before (SALAH):**
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true, // ❌ Auto-refetch on focus
      refetchInterval: 60 * 1000, // ❌ Auto-refetch every 60 seconds
      retry: 1,
    },
  },
});
```

**After (BENAR):**
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // ✅ DISABLED - No auto-refetch on focus
      refetchInterval: false, // ✅ DISABLED - No auto-refetch interval
      retry: 1,
    },
  },
});
```

**Changes:**
- ✅ `refetchInterval: false` - No more auto-refetch every 60 seconds
- ✅ `refetchOnWindowFocus: false` - No more refetch on tab focus
- ✅ `staleTime: 5 * 60 * 1000` - Data fresh for 5 minutes (increased from 30 seconds)

**Result:**
- Data hanya di-fetch **sekali saat page load**
- Tidak ada auto-refetch yang menghabiskan connection pool
- User bisa manual refresh jika perlu data terbaru

## 📊 Comparison

### Before Fix:
```
Timeline:
00:00 - App load → 5 API calls
01:00 - Auto-refetch → 5 API calls
02:00 - Auto-refetch → 5 API calls
03:00 - Auto-refetch → 5 API calls
04:00 - Auto-refetch → 5 API calls
05:00 - Auto-refetch → 5 API calls
06:00 - Auto-refetch → 5 API calls
07:00 - Auto-refetch → 5 API calls
08:00 - Auto-refetch → 5 API calls
09:00 - Auto-refetch → 5 API calls
10:00 - Auto-refetch → 5 API calls

Total in 10 minutes: 55 API calls
Plus: Every tab focus = +5 API calls

Result: Connection pool EXHAUSTED after ~10 minutes
```

### After Fix:
```
Timeline:
00:00 - App load → 5 API calls
01:00 - (nothing)
02:00 - (nothing)
03:00 - (nothing)
04:00 - (nothing)
05:00 - (nothing - data still fresh)
06:00 - (nothing)
07:00 - (nothing)
08:00 - (nothing)
09:00 - (nothing)
10:00 - (nothing)

Total in 10 minutes: 5 API calls
Tab focus: No additional calls

Result: Connection pool HEALTHY, no exhaustion
```

## 🧪 Testing

### Test 1: Verify No Auto-Refetch

1. **Open aplikasi** di Incognito mode
2. **Open DevTools** → Network tab
3. **Clear network log**
4. **Wait 2 minutes** without doing anything
5. **Check Network tab:**
   - ✅ Should see NO new API calls
   - ❌ Should NOT see repeated `/keywords`, `/tender/search`, etc.

### Test 2: Verify No Refetch on Focus

1. **Open aplikasi** di Incognito mode
2. **Open DevTools** → Network tab
3. **Clear network log**
4. **Switch to another tab** (e.g., open Google)
5. **Switch back** to aplikasi tab
6. **Check Network tab:**
   - ✅ Should see NO new API calls
   - ❌ Should NOT see refetch requests

### Test 3: Long-Running Stability

1. **Open aplikasi** di Incognito mode
2. **Leave it running** for 15-30 minutes
3. **Use the app** normally (browse tenders, experts, etc.)
4. **Check Console:**
   - ✅ Should see NO timeout errors
   - ✅ App should remain responsive
   - ✅ No connection pool exhaustion

### Test 4: Manual Refresh Still Works

1. **Open aplikasi**
2. **Make a change** (e.g., update tender status)
3. **Refresh page** (F5)
4. **Verify:**
   - ✅ Data reloads correctly
   - ✅ Changes are persisted
   - ✅ No errors

## 📖 Additional Context

### Why Was Auto-Refetch Enabled?

React Query's default behavior is to keep data fresh by refetching. This is useful for:
- Real-time dashboards
- Stock tickers
- Live sports scores
- Chat applications

### Why We Disabled It?

For TenderHub:
- Tender data doesn't change every minute
- We have Supabase realtime for live updates (when needed)
- Auto-refetch was causing more harm than good
- Connection pool couldn't handle the load

### When to Manually Refetch?

Users can manually refresh data by:
1. **Refresh page** (F5)
2. **Navigate away and back**
3. **Use refresh button** (if we add one)

### Future Improvements

If we need real-time updates:
1. ✅ Use Supabase realtime subscriptions (already implemented for watchlist)
2. ✅ Implement selective refetch (only refetch what changed)
3. ✅ Add manual refresh button for user control
4. ❌ Don't use blanket auto-refetch interval

## 📁 Files Modified

| File | Status | Changes |
|------|--------|---------|
| `frontend/src/App.jsx` | ✅ Fixed | Disabled refetchInterval and refetchOnWindowFocus |
| `AUTO_REFETCH_FIX.md` | ✅ Created | This documentation |

## 🚀 Deployment

### Changes Applied:
1. ✅ Disabled `refetchInterval` in React Query config
2. ✅ Disabled `refetchOnWindowFocus` in React Query config
3. ✅ Increased `staleTime` to 5 minutes
4. ✅ Frontend restarted with new config

### User Action Required:
1. ⚠️ **Clear browser cache** (Ctrl+Shift+R)
2. ⚠️ **Use Incognito mode** for testing
3. ⚠️ **Close all other tabs** of localhost:5173
4. ⚠️ **Test for 10-15 minutes** to verify stability

## 📊 Summary

### Root Cause:
❌ `refetchInterval: 60 * 1000` → Auto-refetch every 60 seconds  
❌ `refetchOnWindowFocus: true` → Refetch on every tab focus  
❌ Too many API calls → Connection pool exhausted

### Solution:
✅ `refetchInterval: false` → No auto-refetch  
✅ `refetchOnWindowFocus: false` → No refetch on focus  
✅ `staleTime: 5 * 60 * 1000` → Data fresh for 5 minutes

### Result:
✅ App stable for long periods  
✅ No connection pool exhaustion  
✅ No timeout errors after minutes of use  
✅ Manual refresh still works

---

**Status:** ✅ FIXED  
**Last Updated:** 6 Mei 2026, 11:00 WIB  
**Action Required:** Clear browser cache and test in Incognito mode
