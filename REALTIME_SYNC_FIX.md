# Fix: Real-time Data Synchronization Antar User

## 🔍 Masalah

Ketika User 1 menambahkan data (tender, expert, dll), User 2 tidak bisa melihat perubahan tersebut secara otomatis. User 2 harus:
- Refresh halaman secara manual (F5)
- Switch tab dan kembali lagi
- Menunggu 5 menit sampai cache expired

## 🎯 Penyebab

### 1. React Query Configuration
```javascript
// SEBELUM (App.jsx)
refetchOnWindowFocus: false  // ❌ Tidak auto-refresh
staleTime: 5 * 60 * 1000     // Data fresh selama 5 menit
```

### 2. Tidak Ada Polling Mechanism
- Aplikasi hanya fetch data saat initial load
- Tidak ada interval polling untuk sync data
- Visibility change handler hanya trigger saat switch tab

### 3. Tidak Ada Real-time Connection
- Tidak menggunakan WebSocket
- Tidak ada Server-Sent Events (SSE)
- Tidak ada long polling

## ✅ Solusi yang Diterapkan

### 1. **Enable Auto-refetch on Window Focus**
**File:** `frontend/src/App.jsx`

```javascript
// SESUDAH
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,           // ✅ 30 detik (lebih pendek)
      cacheTime: 10 * 60 * 1000,      // 10 menit
      refetchOnWindowFocus: true,     // ✅ Auto-refetch saat focus
      refetchInterval: 60 * 1000,     // ✅ Auto-refetch setiap 60 detik
      retry: 1,
    },
  },
});
```

**Benefit:**
- Data auto-refresh setiap 60 detik saat tab aktif
- Data auto-refresh saat user kembali ke tab
- Data dianggap stale setelah 30 detik (lebih responsif)

### 2. **Tambah Polling Interval untuk Tenders**
**File:** `frontend/src/store/AppContext.jsx`

```javascript
useEffect(() => {
  fetchTenders();
  
  // Auto-refresh tenders every 60 seconds
  const intervalId = setInterval(() => {
    console.log('Auto-refreshing tenders data...');
    fetchTenders();
  }, 60 * 1000); // 60 seconds
  
  return () => clearInterval(intervalId);
}, [fetchTenders]);
```

**Benefit:**
- Tenders data auto-refresh setiap 60 detik
- Perubahan status tender dari user lain akan terlihat dalam 1 menit
- Cleanup interval saat component unmount

### 3. **Tambah Polling Interval untuk Experts**
**File:** `frontend/src/store/AppContext.jsx`

```javascript
useEffect(() => {
  if (expertsLoadedRef.current) return;
  expertsLoadedRef.current = true;
  fetchExperts();
  
  // Auto-refresh experts every 2 minutes
  const intervalId = setInterval(() => {
    console.log('Auto-refreshing experts data...');
    fetchExperts();
  }, 2 * 60 * 1000); // 2 minutes
  
  return () => clearInterval(intervalId);
}, [fetchExperts]);
```

**Benefit:**
- Experts data auto-refresh setiap 2 menit
- Expert baru yang ditambahkan user lain akan terlihat dalam 2 menit
- Interval lebih panjang karena experts jarang berubah

### 4. **Tambah Manual Refresh Function**
**File:** `frontend/src/store/AppContext.jsx`

```javascript
const refreshAllData = useCallback(async () => {
  showToast('Menyinkronkan data...', 'info');
  try {
    await Promise.all([
      fetchTenders(),
      fetchExperts(),
    ]);
    showToast('Data berhasil disinkronkan');
  } catch (error) {
    showToast('Gagal menyinkronkan data', 'error');
  }
}, [fetchTenders, fetchExperts, showToast]);
```

**Benefit:**
- User bisa manual sync data kapan saja
- Berguna saat user tahu ada perubahan penting
- Bisa dipanggil dari UI dengan tombol refresh

## 📊 Perbandingan

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Auto-refresh** | ❌ Tidak ada | ✅ Setiap 60 detik (tenders) |
| **Window focus** | ❌ Disabled | ✅ Enabled |
| **Stale time** | 5 menit | 30 detik |
| **Manual refresh** | ❌ Tidak ada | ✅ Ada function |
| **Sync delay** | 5+ menit | ~60 detik |

## 🚀 Cara Menggunakan

### Automatic Sync
Tidak perlu melakukan apa-apa! Data akan otomatis sync:
- Setiap 60 detik untuk tenders
- Setiap 2 menit untuk experts
- Saat user kembali ke tab

### Manual Sync (Opsional)
Jika ingin menambahkan tombol refresh di UI:

```javascript
import { useAppContext } from './store/AppContext';

function MyComponent() {
  const { refreshAllData } = useAppContext();
  
  return (
    <button onClick={refreshAllData}>
      🔄 Refresh Data
    </button>
  );
}
```

## 🔮 Rekomendasi Future Improvement

### 1. **WebSocket untuk Real-time Updates**
Implementasi WebSocket untuk instant updates:
```javascript
// Backend (FastAPI)
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Broadcast changes to all connected clients
```

### 2. **Optimistic Updates**
Update UI immediately sebelum API response:
```javascript
// Immediately update UI
setTendersRaw(prev => [...prev, newTender]);

// Then sync to backend
api.post('/tender', newTender)
  .catch(() => {
    // Rollback if failed
    setTendersRaw(prev => prev.filter(t => t.id !== newTender.id));
  });
```

### 3. **Server-Sent Events (SSE)**
Alternative ke WebSocket yang lebih simple:
```javascript
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update state based on event
};
```

### 4. **Conditional Polling**
Hanya polling saat ada user aktif:
```javascript
const [isActive, setIsActive] = useState(true);

useEffect(() => {
  if (!isActive) return;
  
  const intervalId = setInterval(fetchTenders, 60000);
  return () => clearInterval(intervalId);
}, [isActive, fetchTenders]);
```

## 📝 Testing

### Test Scenario 1: Multi-user Add Data
1. Buka aplikasi di 2 browser berbeda (User 1 & User 2)
2. User 1: Tambah tender baru
3. User 2: Tunggu maksimal 60 detik
4. ✅ User 2 harus melihat tender baru

### Test Scenario 2: Status Update
1. User 1: Update status tender dari "Dipantau" → "Sudah Diikuti"
2. User 2: Tunggu maksimal 60 detik
3. ✅ User 2 harus melihat status ter-update

### Test Scenario 3: Expert Addition
1. User 1: Tambah expert baru
2. User 2: Tunggu maksimal 2 menit
3. ✅ User 2 harus melihat expert baru

### Test Scenario 4: Window Focus
1. User 2: Switch ke tab lain
2. User 1: Tambah data
3. User 2: Kembali ke tab aplikasi
4. ✅ Data langsung ter-refresh

## ⚠️ Catatan Penting

### Performance Considerations
- **Polling interval 60 detik** adalah balance antara real-time dan server load
- Jika server load tinggi, bisa naikkan interval ke 2-3 menit
- Jika butuh lebih real-time, turunkan ke 30 detik atau gunakan WebSocket

### Network Considerations
- Polling akan consume bandwidth
- Untuk mobile/slow connection, pertimbangkan conditional polling
- Error handling sudah ada (silent fail on refresh)

### Browser Considerations
- Interval akan pause saat tab tidak aktif (browser optimization)
- `refetchInterval` dari React Query respect browser tab state
- Visibility change handler sebagai backup mechanism

## 🎉 Hasil

Setelah implementasi ini:
- ✅ User 2 akan melihat perubahan dari User 1 dalam **maksimal 60 detik**
- ✅ Tidak perlu manual refresh halaman
- ✅ Data tetap sync meskipun user tidak switch tab
- ✅ Backward compatible dengan existing code
- ✅ Minimal impact pada performance

---

**Tanggal:** 4 Mei 2026  
**Status:** ✅ Implemented  
**Impact:** High - Menyelesaikan masalah sync data antar user
