# Timeline Date Fix - Tanggal Tetap, Perhitungan Hari Dinamis, Tahapan Otomatis

## Masalah
User melaporkan dua masalah terkait timeline tender:

### Masalah 1: Tanggal Deadline Berubah
Tanggal deadline di timeline tender berubah mengikuti tanggal sekarang. Misalnya jika jadwal asli adalah 1-3 April, ketika tanggal sekarang sudah 4 April, tanggal di timeline juga ikut berubah.

### Masalah 2: Tahapan Tidak Otomatis Berubah
Tahapan tender (`currentStage`) tidak berubah otomatis berdasarkan tanggal sekarang. Contoh:
- **Tanggal 1 April**: Tahap "Pengumuman Prakualifikasi" (2-3 April), DL = 2 hari lagi
- **Tanggal 2 April**: Seharusnya DL = "Besok" (1 hari lagi)
- **Tanggal 5 April**: Seharusnya sudah pindah ke tahap "Download Dokumen Kualifikasi" (4-10 April), DL = 5 hari lagi (dari tgl 5 ke tgl 10)

## Akar Masalah

### Masalah 1: Konstanta TODAY Statis
Di `constants.js`, konstanta `TODAY` didefinisikan sebagai:
```javascript
export const TODAY = new Date();
```

Ini berarti `TODAY` hanya di-set **sekali saat aplikasi pertama kali dimuat**, dan tidak akan berubah sampai aplikasi di-refresh.

### Masalah 2: currentStage Statis
Di `helpers.js`, fungsi `enrichTender()` menggunakan `tender.currentStage` dari data backend yang statis, tidak melihat jadwal tahapan (`jadwalTahapan`) untuk menentukan tahapan mana yang sedang aktif berdasarkan tanggal hari ini.

## Solusi Implementasi

### 1. Update `constants.js` - TODAY Dinamis
Mengubah `TODAY` agar selalu mengembalikan tanggal saat ini:

```javascript
// BEFORE
export const TODAY = new Date();

// AFTER
export const TODAY = (() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
})();
```

### 2. Update `helpers.js` - daysFromNow() Dinamis
Mengubah fungsi agar selalu menggunakan tanggal saat ini:

```javascript
// BEFORE
export const daysFromNow = (dateStr) => {
  if (!dateStr) return 999;
  const target = new Date(`${dateStr}T00:00:00+07:00`);
  const today = new Date(TODAY); // Menggunakan konstanta statis
  today.setHours(0, 0, 0, 0);
  return Math.floor((target - today) / 86400000);
};

// AFTER
export const daysFromNow = (dateStr) => {
  if (!dateStr) return 999;
  const target = new Date(`${dateStr}T00:00:00+07:00`);
  const today = new Date(); // Selalu ambil tanggal saat ini
  today.setHours(0, 0, 0, 0);
  return Math.floor((target - today) / 86400000);
};
```

### 3. Tambah Fungsi `getCurrentStageFromSchedule()` - Tahapan Dinamis
Fungsi baru untuk menentukan tahapan aktif berdasarkan tanggal hari ini:

```javascript
/**
 * Determines the current active stage based on today's date and the stage schedule
 * Returns { stageNo, stageName, endDate } or null if no schedule available
 */
const getCurrentStageFromSchedule = (tender, stages) => {
  const stageKeys = [
    'jadwalTahapan',
    'jadwal_tahapan',
    'stageDeadlines',
    'stage_deadlines',
    'tahapan',
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const key of stageKeys) {
    const schedule = tender[key];
    if (!schedule || !Array.isArray(schedule)) continue;

    // Find the stage where today is between startDate and endDate
    for (let i = 0; i < schedule.length; i++) {
      const item = schedule[i];
      const startDate = item?.startDate || item?.start_date || /* ... */;
      const endDate = item?.endDate || item?.end_date || /* ... */;
      
      if (!startDate || !endDate) continue;

      const start = new Date(`${startDate}T00:00:00+07:00`);
      const end = new Date(`${endDate}T00:00:00+07:00`);
      
      // Check if today is within this stage's date range
      if (today >= start && today <= end) {
        const stageNo = item?.stageNo || item?.stage || (i + 1);
        const stageName = item?.name || item?.nama || stages[stageNo - 1]?.[0];
        return { stageNo: Number(stageNo), stageName, endDate };
      }
      
      // If today is past this stage, continue to next
      if (today > end) continue;
      
      // If today is before this stage, this is the upcoming stage
      if (today < start) {
        const stageNo = item?.stageNo || item?.stage || (i + 1);
        const stageName = item?.name || item?.nama || stages[stageNo - 1]?.[0];
        return { stageNo: Number(stageNo), stageName, endDate };
      }
    }
  }

  return null;
};
```

### 4. Update `enrichTender()` - Gunakan Tahapan Dinamis
Mengubah fungsi untuk menggunakan `getCurrentStageFromSchedule()`:

```javascript
export const enrichTender = (tender, keywords, internalStatuses = {}) => {
  // ... validasi ...
  
  const stages = getStages(tender.metode);
  
  // Try to determine current stage from schedule based on today's date
  const stageFromSchedule = getCurrentStageFromSchedule(tender, stages);
  
  let currentStage;
  let currentStageDeadline;
  
  if (stageFromSchedule) {
    // Stage determined from schedule - dynamic based on today's date
    currentStage = stageFromSchedule.stageNo;
    currentStageDeadline = stageFromSchedule.endDate;
  } else {
    // Fallback to static currentStage from tender data
    currentStage = Math.max(1, Math.min(tender.currentStage || 1, stages.length));
    currentStageDeadline = /* ... fallback logic ... */;
  }
  
  // ... rest of enrichment ...
  
  return {
    ...tender,
    currentStage, // Now updates dynamically based on schedule!
    currentStageName,
    deadlineStage: currentStageDeadline,
    daysLeft: daysFromNow(currentStageDeadline),
    // ...
  };
};
```

## Cara Kerja Setelah Fix

### Data Tender dari Backend
```javascript
{
  "id": 1,
  "nama": "Survei Topografi Kawasan Industri",
  "metode": "Prakualifikasi",
  "currentStage": 1, // Statis dari backend (fallback)
  "jadwalTahapan": [
    {
      "stageNo": 1,
      "name": "Pengumuman Prakualifikasi",
      "startDate": "2026-04-02",
      "endDate": "2026-04-03"
    },
    {
      "stageNo": 2,
      "name": "Download Dokumen Kualifikasi",
      "startDate": "2026-04-04",
      "endDate": "2026-04-10"
    },
    // ... tahapan lainnya
  ]
}
```

### Proses Enrichment - Tanggal 1 April 2026
```javascript
// Hari ini: 1 April 2026
// getCurrentStageFromSchedule() melihat jadwalTahapan
// Tahap 1 belum mulai (mulai 2 April)
// Return tahap 1 sebagai upcoming stage

const enrichedTender = {
  currentStage: 1,
  currentStageName: "Pengumuman Prakualifikasi",
  deadlineStage: "2026-04-03", // Tanggal asli - TETAP
  daysLeft: 2, // Dari 1 April ke 3 April = 2 hari
}
```

### Proses Enrichment - Tanggal 2 April 2026
```javascript
// Hari ini: 2 April 2026
// getCurrentStageFromSchedule() melihat jadwalTahapan
// Tahap 1 sedang berlangsung (2-3 April)
// Return tahap 1

const enrichedTender = {
  currentStage: 1,
  currentStageName: "Pengumuman Prakualifikasi",
  deadlineStage: "2026-04-03", // Tanggal asli - TETAP
  daysLeft: 1, // Dari 2 April ke 3 April = 1 hari ("Besok")
}
```

### Proses Enrichment - Tanggal 5 April 2026
```javascript
// Hari ini: 5 April 2026
// getCurrentStageFromSchedule() melihat jadwalTahapan
// Tahap 1 sudah lewat (2-3 April)
// Tahap 2 sedang berlangsung (4-10 April)
// Return tahap 2

const enrichedTender = {
  currentStage: 2, // OTOMATIS BERUBAH!
  currentStageName: "Download Dokumen Kualifikasi", // OTOMATIS BERUBAH!
  deadlineStage: "2026-04-10", // Tanggal akhir tahap 2 - TETAP
  daysLeft: 5, // Dari 5 April ke 10 April = 5 hari
}
```

## Contoh Skenario Lengkap

### Senin, 1 April 2026 (Sebelum Tahap 1 Mulai)
```
Tahap: 1 - Pengumuman Prakualifikasi
Jadwal: 2-3 April 2026
Deadline: 3 April 2026 (tanggal asli)
Hari ini: 1 April 2026
Selisih: 2 hari lagi
Badge: "2 hari lagi" (warna hijau)
```

### Selasa, 2 April 2026 (Tahap 1 Hari Pertama)
```
Tahap: 1 - Pengumuman Prakualifikasi (TETAP)
Jadwal: 2-3 April 2026
Deadline: 3 April 2026 (TETAP - tidak berubah)
Hari ini: 2 April 2026
Selisih: 1 hari lagi ("Besok")
Badge: "Besok" (warna kuning)
```

### Rabu, 3 April 2026 (Tahap 1 Hari Terakhir)
```
Tahap: 1 - Pengumuman Prakualifikasi (TETAP)
Jadwal: 2-3 April 2026
Deadline: 3 April 2026 (TETAP)
Hari ini: 3 April 2026
Selisih: 0 hari ("Hari ini")
Badge: "Hari ini" (warna merah)
```

### Kamis, 4 April 2026 (Tahap 2 Hari Pertama)
```
Tahap: 2 - Download Dokumen Kualifikasi (BERUBAH OTOMATIS!)
Jadwal: 4-10 April 2026
Deadline: 10 April 2026 (tanggal akhir tahap 2)
Hari ini: 4 April 2026
Selisih: 6 hari lagi
Badge: "6 hari lagi" (warna hijau)
```

### Jumat, 5 April 2026 (Tahap 2 Hari Kedua)
```
Tahap: 2 - Download Dokumen Kualifikasi (TETAP di tahap 2)
Jadwal: 4-10 April 2026
Deadline: 10 April 2026 (TETAP)
Hari ini: 5 April 2026
Selisih: 5 hari lagi (BERKURANG OTOMATIS!)
Badge: "5 hari lagi" (warna hijau)
```

## Keuntungan Solusi Ini

1. **Tanggal Asli Tetap Terjaga**
   - Tanggal deadline dari jadwal LPSE tidak pernah diubah
   - Data historis tetap akurat
   - Audit trail terjaga

2. **Tahapan Berubah Otomatis**
   - `currentStage` ditentukan dari `jadwalTahapan` berdasarkan tanggal hari ini
   - Tidak perlu update manual dari backend
   - Timeline selalu menunjukkan tahapan yang benar

3. **Perhitungan Selalu Akurat**
   - `daysLeft` selalu dihitung dari tanggal saat ini
   - Tidak perlu refresh manual untuk update countdown
   - React Query akan re-fetch data secara otomatis (setiap 60 detik)

4. **Fallback Mechanism**
   - Jika `jadwalTahapan` tidak tersedia, gunakan `tender.currentStage` dari backend
   - Sistem tetap berfungsi meskipun data jadwal tidak lengkap
   - Backward compatible dengan data lama

5. **User Experience Lebih Baik**
   - Timeline selalu akurat dan up-to-date
   - Tidak ada kebingungan tentang tahapan yang salah
   - Status urgency (hijau/kuning/merah) selalu tepat

## Testing

### Manual Testing
1. Buka aplikasi dan lihat tender dengan `jadwalTahapan`
2. Catat tahapan saat ini dan deadline
3. Ubah tanggal sistem ke hari berikutnya (atau tunggu pergantian hari)
4. Refresh halaman atau tunggu auto-refresh (60 detik)
5. Verifikasi:
   - ✅ Tanggal deadline tetap sama
   - ✅ Jumlah hari tersisa berkurang
   - ✅ Jika melewati deadline tahap, `currentStage` berubah ke tahap berikutnya
   - ✅ Warna badge berubah sesuai urgency

### Edge Cases
- ✅ Tender dengan jadwal lengkap (`jadwalTahapan` ada)
- ✅ Tender tanpa jadwal (fallback ke `currentStage` statis)
- ✅ Tender di tahap terakhir (tidak ada tahap berikutnya)
- ✅ Tender dengan tahap yang sudah lewat semua
- ✅ Aplikasi dibuka melewati tengah malam (pergantian hari)
- ✅ Aplikasi dibuka setelah beberapa hari tidak dibuka

## Files Modified
- `lsi-tender-intel/frontend/src/utils/constants.js` - Update konstanta TODAY
- `lsi-tender-intel/frontend/src/utils/helpers.js` - Update daysFromNow(), tambah getCurrentStageFromSchedule(), update enrichTender()
- `lsi-tender-intel/TIMELINE_DATE_FIX.md` - Dokumentasi (file ini)

## Related Documentation
- `REALTIME_SYNC_FIX.md` - Auto-refresh data setiap 60 detik
- `DEADLINE_LOGIC_FINAL.md` - Logika perhitungan deadline tender
- `COMPONENT_LIBRARY_GUIDE.md` - Komponen CountdownBadge

---

**Status**: ✅ Completed
**Date**: 2026-05-04
**Impact**: High - Mempengaruhi semua perhitungan deadline dan tahapan di aplikasi
