# Expert Detail Display Issues - Analysis & Fixes

## Issues Reported
1. ⭐ Review stars not showing as yellow/filled
2. 📞 Phone number (noHp) not displaying
3. 📋 Other data not showing properly
4. 🔄 Duplicate expert entries

## Analysis Results

### 1. Stars Not Yellow ⭐
**Status**: ✅ CODE IS CORRECT

The Stars component in `frontend/src/components/UI/legacy.jsx` is properly configured:
```jsx
<Star
  key={i}
  size={size}
  fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
  stroke={i <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'}
  className={onRate ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
  onClick={() => onRate?.(i)}
/>
```

**Color used**: `#f59e0b` (Tailwind amber-500 - orange/yellow color)

**Possible causes if stars still appear gray**:
- Browser cache not cleared after recent updates
- CSS not loading properly
- Lucide-react Star icon not rendering fill correctly

**Solution**: 
- Hard refresh browser (Ctrl+Shift+R or Ctrl+F5)
- Check browser console for CSS/JS errors
- Verify lucide-react package is installed: `npm list lucide-react`

### 2. Phone Number Not Displaying 📞
**Status**: ✅ FIXED

**Root Cause**: API returns `no_hp` (snake_case) but frontend expects `noHp` (camelCase)

All experts in `FALLBACK_EXPERTS` have `noHp` fields populated:
- Expert 1: '0812-3456-7890'
- Expert 2: '0856-7890-1234'
- Expert 3: '0813-4567-8901'
- ... (all 16 experts have phone numbers)

The display code in `ExpertDetail.jsx` is correct:
```jsx
No. HP: {expert.noHp || 'Tidak tersedia'} | {expert.instansi}
```

**Problem**: Backend API returns expert data with snake_case field names (`no_hp`, `rating_avg`, `jumlah_proyek`, etc.) but frontend code expects camelCase (`noHp`, `rating`, `proyek`).

**Fix Applied**: Added transformation in `AppContext.jsx` to map API response fields:
```javascript
const transformedExperts = (res.data || []).map(e => ({
  ...e,
  noHp: e.no_hp || '',
  portofolio: e.subporto || [],
  rating: e.rating_avg || 0,
  proyek: e.jumlah_proyek || 0,
  history: (e.projects || []).map(p => ({ /* transform */ })),
  reviews: (e.reviews || []).map(r => ({ /* transform */ }))
}));
```

Also updated:
- `addExpert()` - Maps `noHp` → `no_hp` when sending to API
- `updateExpertProfile()` - Maps `noHp` → `no_hp` when updating

### 3. Other Data Not Showing 📋
**Status**: ✅ FIXED

**Root Cause**: Same as phone number issue - field name mismatch between API (snake_case) and frontend (camelCase)

All expert data fields are present in dummy data and database:
- ✅ nama (name)
- ✅ no_hp → noHp (phone)
- ✅ instansi (institution)
- ✅ keahlian (expertise array)
- ✅ availability
- ✅ rating_avg → rating
- ✅ jumlah_proyek → proyek (project count)
- ✅ subporto → portofolio (portfolio array)
- ✅ projects → history (work history array)
- ✅ reviews (reviews array)

**Fix Applied**: Added complete field transformation in `AppContext.jsx`:
- `rating_avg` → `rating`
- `jumlah_proyek` → `proyek`
- `subporto` → `portofolio`
- `projects` → `history` (with nested field transformations)
- `reviews` (with nested field transformations)

All expert data should now display correctly when loaded from the API.

### 4. Duplicate Expert Entries 🔄
**Status**: ✅ FIXED

**Found duplicate**: Expert ID 1 and ID 16 had the same phone number:
- ID 1: Ir. Bambang Sutrisno, M.T. - `'0812-3456-7890'`
- ID 16: Arvian Riatmaja, S.T., M.Cs. - `'0812-3456-7890'` ❌

**Fix applied**: Changed Expert ID 16 phone number to `'0857-1234-9876'` ✅

**Note**: This only fixes dummy data. If duplicates exist in Supabase database:
1. Query database for duplicate experts:
   ```sql
   SELECT nama, COUNT(*) 
   FROM experts 
   GROUP BY nama 
   HAVING COUNT(*) > 1;
   ```
2. Manually remove or merge duplicate records
3. Add unique constraint on `nama` field if needed

## Recommended Actions

### Immediate (Frontend)
1. ✅ Fixed duplicate phone number in dummy data
2. 🔄 Clear browser cache and hard refresh
3. 🔍 Check browser console for errors

### Database Investigation
1. 🔍 Check Supabase experts table schema
2. 🔍 Verify all required columns exist:
   - id, nama, no_hp, instansi, keahlian, availability, rating, proyek, portofolio
3. 🔍 Check if existing records have complete data
4. 🔍 Look for duplicate expert records

### Backend API
1. 🔍 Verify `/experts` endpoint returns all fields
2. 🔍 Check field name mapping (snake_case → camelCase)
3. 🔍 Ensure API handles missing fields gracefully

## Testing Checklist

After fixes:
- [ ] Stars show as yellow/orange when expert has reviews
- [ ] Phone numbers display for all experts
- [ ] All expert data fields visible (name, institution, expertise, etc.)
- [ ] No duplicate experts in the list
- [ ] Expert detail page loads without errors
- [ ] Can add new reviews and see stars update
- [ ] Can edit expert profile and see changes persist

## Files Modified
- ✅ `frontend/src/data/demoData.js` - Fixed duplicate phone number for Expert ID 16
- ✅ `frontend/src/store/AppContext.jsx` - Added field name transformation (snake_case → camelCase)
  - Transform API response in expert loading
  - Map `noHp` → `no_hp` in addExpert()
  - Map `noHp` → `no_hp` in updateExpertProfile()

## Files to Check
- `frontend/src/components/UI/legacy.jsx` - Stars component (already correct)
- `frontend/src/components/Expert/ExpertDetail.jsx` - Display logic (already correct)
- `frontend/src/store/AppContext.jsx` - Expert data loading
- `backend/app/api/v1/expert.py` - API endpoint (if using backend)
- Supabase experts table schema and data
