# Deadline Logic Documentation

## Overview
Sistem deadline pada aplikasi LSI Tender Intel dirancang untuk menampilkan sisa waktu hingga akhir tahap tender yang sedang berjalan.

## Tanggal Referensi
- **Hari ini**: 1 Mei 2026 (01/05/2026)
- Semua perhitungan deadline menggunakan tanggal ini sebagai referensi

## Logika Perhitungan Deadline

### 1. Data Source
Deadline dihitung dari `stageDeadlines` array yang berisi jadwal semua tahapan tender:
```javascript
stageDeadlines: [
  { 
    stageNo: 1, 
    name: 'Pengumuman Prakualifikasi', 
    startDate: '2026-04-15', 
    endDate: '2026-04-22' 
  },
  { 
    stageNo: 2, 
    name: 'Download Dokumen Kualifikasi', 
    startDate: '2026-04-23', 
    endDate: '2026-04-28' 
  },
  { 
    stageNo: 3, 
    name: 'Penjelasan Dokumen Prakualifikasi', 
    startDate: '2026-04-29', 
    endDate: '2026-05-01' 
  },
  // ... dst
]
```

### 2. Auto-Generation untuk Tender Tanpa stageDeadlines
Jika tender tidak memiliki `stageDeadlines`, sistem akan otomatis generate menggunakan fungsi `generateStageDeadlines()`:

**Prinsip:**
- Current stage **selalu berakhir hari ini** (1 Mei 2026)
- Tahap sebelumnya dihitung mundur dari hari ini
- Tahap berikutnya dihitung maju dari hari ini

**Durasi Default (dalam hari):**
- **Prakualifikasi**: [7, 5, 3, 7, 5, 3, 2, 3, 5, 5, 3, 7, 5, 3, 5, 2, 3, 5, 4, 2, 3]
- **Pascakualifikasi**: [7, 5, 3, 7, 5, 7, 3, 2, 3, 5, 2, 3]

**Contoh:**
Tender dengan `currentStage: 3` dan `metode: 'Prakualifikasi'`:
- Tahap 1: 7 hari
- Tahap 2: 5 hari  
- Tahap 3: 3 hari (berakhir hari ini)
- Mulai dari: 1 Mei - (7+5+3) = 16 April 2026
- Tahap 3 berakhir: 16 April + 7 + 5 + 3 = 1 Mei 2026 ✓

### 3. Enrichment Process
Fungsi `enrichTender()` di `helpers.js` memproses data tender:

```javascript
const currentStageDeadline =
  tender.currentStageDeadline ||
  tender.deadlineCurrentStage ||
  tender.tgl_akhir_tahap_berjalan ||
  getStageDeadlineFromSchedule(tender, currentStage, currentStageName) ||
  tender.deadlineStage;
```

Fungsi `getStageDeadlineFromSchedule()` mencari `endDate` dari tahap yang sesuai di `stageDeadlines` array.

### 4. Display Logic (CountdownBadge)
Badge menampilkan sisa hari dengan color coding:

```javascript
if (calculatedDays < 0) {
  color = 'red';
  text = 'Terlewat';
} else if (calculatedDays === 0) {
  color = 'red';
  text = 'Hari ini';
} else if (calculatedDays === 1) {
  color = 'amber';
  text = 'Besok';
} else if (calculatedDays <= 3) {
  color = 'red';
  text = `${calculatedDays} hari lagi`;
} else if (calculatedDays <= 7) {
  color = 'amber';
  text = `${calculatedDays} hari lagi`;
} else {
  color = 'green';
  text = `${calculatedDays} hari lagi`;
}
```

**Color Coding:**
- 🔴 **Red**: Hari ini, besok, atau ≤3 hari (urgent)
- 🟡 **Amber**: 4-7 hari (perlu perhatian)
- 🟢 **Green**: >7 hari (aman)

## Contoh Kasus

### Tender ID 1: Survei Topografi Batang
- **Current Stage**: 3 (Penjelasan Dokumen Prakualifikasi)
- **Stage End Date**: 2026-05-01
- **Hari ini**: 2026-05-01
- **Deadline Display**: "Hari ini" (red badge)
- **Perhitungan**: (2026-05-01) - (2026-05-01) = 0 hari ✓

### Tender ID 2: Pendataan Gizi Nasional
- **Current Stage**: 7 (Penetapan Hasil Kualifikasi)
- **Stage End Date**: 2026-05-03
- **Hari ini**: 2026-05-01
- **Deadline Display**: "2 hari lagi" (red badge)
- **Perhitungan**: (2026-05-03) - (2026-05-01) = 2 hari ✓

### Tender ID 3-12: Auto-Generated
Semua tender lainnya menggunakan `generateStageDeadlines()` yang memastikan current stage berakhir hari ini (1 Mei 2026), sehingga semua akan menampilkan "Hari ini".

## File Terkait
- `/frontend/src/data/demoData.js` - Data tender dan fungsi generateStageDeadlines()
- `/frontend/src/utils/helpers.js` - Fungsi enrichTender() dan getStageDeadlineFromSchedule()
- `/frontend/src/components/UI/Badge.jsx` - CountdownBadge component untuk display

## Testing
Untuk memverifikasi deadline:
1. Buka aplikasi di browser
2. Periksa badge deadline di TenderTable
3. Klik tender untuk melihat detail timeline
4. Pastikan current stage ditandai dengan highlight dan deadline sesuai

## Maintenance
Jika perlu mengubah tanggal referensi "hari ini":
1. Update `const today = new Date('2026-05-01')` di `generateStageDeadlines()`
2. Update `export const TODAY = new Date('2026-05-01')` di `constants.js`
3. Refresh aplikasi untuk melihat perubahan
