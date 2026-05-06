# Watchlist Status Sync Fix

## Problem
Status changes were saving to the database but not syncing between users. When User A changed a tender status, User B wouldn't see the change even after refreshing.

## Root Cause
1. **Backend API Timeout**: The Railway backend `GET /watchlist` endpoint was timing out (30+ seconds), causing the frontend to fall back to local dummy data
2. **Upsert Conflict Error**: When we tried to bypass the backend and use Supabase directly, the `upsert()` operation failed with a 400 Bad Request error because `kd_tender` is NOT a unique constraint in the `tender_watchlist` table

## Database Schema Issue
In `backend/app/models/watchlist.py`:
```python
kd_tender = Column(Integer, nullable=False, index=True)  # ❌ Indexed but NOT unique
```

The `upsert()` operation requires a unique constraint to work with `onConflict`, but `kd_tender` only has an index, not a unique constraint.

## Solution
Changed the `ensureWatchlistEntry` function in `frontend/src/store/AppContext.jsx` to use a **check-then-insert/update pattern** instead of `upsert`:

### Before (Failed):
```javascript
const { error } = await supabase
  .from('tender_watchlist')
  .upsert({
    kd_tender: parseInt(tenderId),
    status_internal: patch.status_internal ?? (internalStatuses[tenderId] || 'Dipantau'),
    nama_paket: tender?.nama || tender?.nama_paket || null,
    hps: tender?.hps || null,
    ...patch,
  }, { onConflict: 'kd_tender' });  // ❌ Fails - no unique constraint
```

### After (Works):
```javascript
// 1. Check if entry exists
const { data: existing, error: selectError } = await supabase
  .from('tender_watchlist')
  .select('id')
  .eq('kd_tender', parseInt(tenderId))
  .maybeSingle();

if (selectError) throw new Error(selectError.message);

const payload = {
  kd_tender: parseInt(tenderId),
  status_internal: patch.status_internal ?? (internalStatuses[tenderId] || 'Dipantau'),
  nama_paket: tender?.nama || tender?.nama_paket || null,
  hps: tender?.hps || null,
  ...patch,
};

if (existing) {
  // 2a. Update existing entry
  const { error } = await supabase
    .from('tender_watchlist')
    .update(payload)
    .eq('id', existing.id);
  if (error) throw new Error(error.message);
} else {
  // 2b. Insert new entry
  const { error } = await supabase
    .from('tender_watchlist')
    .insert(payload);
  if (error) throw new Error(error.message);
}
```

## How It Works Now
1. **User A changes status** → `updateTenderStatus()` → `ensureWatchlistEntry()` → Writes directly to Supabase
2. **User B loads page** → `loadTendersAndWatchlist()` → Reads directly from Supabase → Sees User A's changes
3. **User B refetches** → `refetchTenders()` → Reads directly from Supabase → Sees latest changes

## Benefits
- ✅ Status changes sync instantly between users
- ✅ No more reliance on slow Railway backend API for watchlist operations
- ✅ Works around the missing unique constraint without requiring database migration
- ✅ All watchlist operations (status, PIC, notes) now use direct Supabase access

## Files Modified
- `frontend/src/store/AppContext.jsx` - Fixed `ensureWatchlistEntry()` function

## Testing
To verify the fix works:
1. Open the app in two different browsers (or incognito + normal)
2. Login as different users in each browser
3. Change a tender status in Browser A
4. Refresh Browser B
5. ✅ Browser B should now show the updated status from Browser A

## Future Improvement (Optional)
If you want to add a unique constraint to `kd_tender` in the future, you can run this SQL migration:

```sql
ALTER TABLE tender_watchlist ADD CONSTRAINT unique_kd_tender UNIQUE (kd_tender);
```

Then you can simplify the code back to using `upsert()` with `onConflict: 'kd_tender'`.
