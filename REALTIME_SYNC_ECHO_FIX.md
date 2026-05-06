# Fix: Realtime Sync Echo Prevention

## Masalah
Perubahan yang dibuat user (seperti mengubah status internal tender) akan **kembali ke kondisi awal** setelah beberapa saat. Ini terjadi karena:

1. User mengubah status → Optimistic update di UI ✅
2. Backend menyimpan perubahan → Database updated ✅
3. Supabase realtime trigger → `refetchTenders()` dipanggil 🔴
4. **Full refetch menimpa semua state termasuk perubahan yang baru dibuat** ❌

## Solusi

### 1. **Granular State Updates** (bukan full refetch)
Mengubah `useWatchlistRealtime` dari:
```javascript
// ❌ SEBELUM: Full refetch (menimpa semua state)
refetchTenders();
```

Menjadi:
```javascript
// ✅ SESUDAH: Update hanya field yang berubah
setInternalStatuses(prev => ({
  ...prev,
  [tenderId]: newRecord.status_internal
}));
```

### 2. **Echo Prevention** (mencegah update dari diri sendiri)
Menggunakan custom event untuk menandai update lokal:

```javascript
// Di AppContext saat user melakukan perubahan:
window.dispatchEvent(new CustomEvent('tender-local-update', { 
  detail: { tenderId } 
}));

// Di useWatchlistRealtime:
const lastLocalUpdate = lastLocalUpdateRef.current[recordId];
if (lastLocalUpdate && Date.now() - lastLocalUpdate < 3000) {
  console.log('Skipping echo - this is our own update');
  return; // Skip processing
}
```

### 3. **Selective Field Updates**
Hanya update field yang benar-benar berubah:
- `status_internal` → `setInternalStatuses`
- `assigned_pic` → `setAssignedPICs`
- `catatan_internal` → `setTenderNotes`

## File yang Diubah

### `frontend/src/hooks/useWatchlistRealtime.js`
- ✅ Menghapus `refetchTenders()` yang meng-override semua state
- ✅ Menambahkan granular updates per field
- ✅ Menambahkan echo prevention dengan timestamp tracking
- ✅ Menambahkan logging untuk debugging

### `frontend/src/store/AppContext.jsx`
- ✅ Menambahkan `window.dispatchEvent` di `updateTenderStatus`
- ✅ Menambahkan `window.dispatchEvent` di `updateTenderPIC`
- ✅ Menambahkan `window.dispatchEvent` di `addTenderNote`

## Cara Kerja

```
User Action Flow:
1. User mengubah status → "Dipantau" ke "Akan Diikuti"
2. dispatchEvent('tender-local-update') → Mark timestamp
3. Optimistic update → UI langsung berubah
4. API call → PATCH /watchlist/{id}
5. Database updated → Supabase realtime trigger
6. useWatchlistRealtime menerima event
7. Check timestamp → "Ini update kita sendiri, skip!"
8. ✅ UI tetap menampilkan "Akan Diikuti"

External Update Flow (dari user lain):
1. User B mengubah status tender yang sama
2. Database updated → Supabase realtime trigger
3. useWatchlistRealtime menerima event
4. Check timestamp → "Bukan update kita, process!"
5. setInternalStatuses → Update hanya tender ini
6. ✅ UI menampilkan perubahan dari User B
```

## Testing

Untuk memverifikasi fix ini bekerja:

1. **Test Local Update:**
   - Ubah status tender
   - Tunggu 5 detik
   - Status harus tetap sesuai yang Anda ubah ✅

2. **Test External Update:**
   - Buka aplikasi di 2 browser/tab berbeda
   - Ubah status di tab 1
   - Tab 2 harus otomatis update ✅

3. **Test Console Logs:**
   - Buka DevTools Console
   - Ubah status tender
   - Harus muncul: `[Realtime] Skipping echo for tender X`

## Keuntungan

1. ✅ **Perubahan user tidak hilang** - Echo prevention mencegah override
2. ✅ **Performa lebih baik** - Tidak perlu refetch 200 tenders setiap kali ada perubahan
3. ✅ **Real-time sync tetap berfungsi** - Update dari user lain tetap diterima
4. ✅ **Lebih scalable** - Hanya update data yang berubah

## Catatan

- Echo prevention window: **3 detik** (bisa disesuaikan jika perlu)
- Logging diaktifkan untuk debugging (bisa dimatikan di production)
- Backward compatible dengan data yang sudah ada
