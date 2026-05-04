# Fix: Button Debounce & Toast Notification

## 🔍 Masalah

1. **Tombol Save bisa diklik berkali-kali** sebelum request selesai
   - Menyebabkan duplicate data (tenaga ahli, catatan, review)
   - Tidak ada loading state
   - User tidak tahu apakah proses sedang berjalan

2. **Notifikasi toast tidak terlihat jelas**
   - Posisi di kanan atas (user minta kanan bawah)
   - Tidak ada feedback yang jelas saat save berhasil/gagal

3. **Lag saat menambah tenaga ahli**
   - Multiple clicks membuat multiple API calls
   - Duplicate entries di database

## ✅ Solusi yang Diterapkan

### 1. **Tambah Loading State di ExpertPage (Tambah Tenaga Ahli)**

**File:** `frontend/src/pages/ExpertPage.jsx`

**Perubahan:**
```javascript
// Tambah state
const [isSaving, setIsSaving] = useState(false);

// Update button handler
<Btn 
  className="primary" 
  disabled={isSaving}
  onClick={async () => {
    if (isSaving) return; // Prevent double-click
    
    setIsSaving(true);
    try {
      const success = await addExpert(newExpert);
      if (success) {
        // Reset form & close
      }
    } catch (error) {
      showToast('Terjadi kesalahan saat menambah tenaga ahli', 'error');
    } finally {
      setIsSaving(false);
    }
  }}
>
  {isSaving ? 'Menyimpan...' : 'Simpan'}
</Btn>
```

**Benefit:**
- ✅ Tombol disabled saat proses save
- ✅ Text berubah jadi "Menyimpan..." untuk feedback visual
- ✅ Prevent multiple clicks
- ✅ Tidak ada duplicate data lagi

---

### 2. **Tambah Loading State di TenderDetail (Status & Catatan)**

**File:** `frontend/src/components/Tender/TenderDetail.jsx`

**Perubahan:**

#### A. Update Status Internal
```javascript
const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

const setStatus = async (val) => {
  if (isUpdatingStatus) return;
  setIsUpdatingStatus(true);
  try {
    await updateTenderStatus(tender.id, val);
  } finally {
    setIsUpdatingStatus(false);
  }
};

// Select dengan disabled state
<select 
  value={status} 
  onChange={e => setStatus(e.target.value)}
  disabled={isUpdatingStatus}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
```

#### B. Tambah Catatan
```javascript
const [isSavingNote, setIsSavingNote] = React.useState(false);

const handleAddNote = async () => {
  if (!newNote.trim()) {
    showToast('Catatan tidak boleh kosong', 'error');
    return;
  }
  if (isSavingNote) return;
  
  setIsSavingNote(true);
  try {
    await addTenderNote(tender.id, noteObj);
    setNewNote('');
  } finally {
    setIsSavingNote(false);
  }
};

// Button dengan loading state
<Btn 
  className="primary small" 
  onClick={handleAddNote}
  disabled={isSavingNote || !newNote.trim()}
>
  <Save size={14} />
  {isSavingNote ? 'Menyimpan...' : 'Tambah Catatan'}
</Btn>
```

**Benefit:**
- ✅ Status update tidak bisa diklik berkali-kali
- ✅ Catatan tidak duplicate
- ✅ Validasi input (tidak boleh kosong)
- ✅ Visual feedback dengan text "Menyimpan..."

---

### 3. **Tambah Loading State di ExpertDetail (Review & History)**

**File:** `frontend/src/components/Expert/ExpertDetail.jsx`

**Perubahan:**

#### A. Tambah Review
```javascript
const [isSavingReview, setIsSavingReview] = useState(false);

<Btn 
  className="primary small self-start" 
  onClick={async () => {
    if (isSavingReview) return;
    setIsSavingReview(true);
    try {
      await addReview(expert.id);
    } finally {
      setIsSavingReview(false);
    }
  }}
  disabled={isSavingReview}
>
  <Save size={14} />
  {isSavingReview ? 'Menyimpan...' : 'Simpan Review'}
</Btn>
```

#### B. Tambah Riwayat Pekerjaan
```javascript
const [isSavingHistory, setIsSavingHistory] = useState(false);

<Btn 
  className="primary small mt-3" 
  onClick={async () => {
    if (isSavingHistory) return;
    setIsSavingHistory(true);
    try {
      await addHistory(expert.id);
    } finally {
      setIsSavingHistory(false);
    }
  }}
  disabled={isSavingHistory}
>
  <Plus size={14} />
  {isSavingHistory ? 'Menyimpan...' : 'Simpan Riwayat'}
</Btn>
```

**Benefit:**
- ✅ Review tidak duplicate
- ✅ Riwayat pekerjaan tidak duplicate
- ✅ Clear visual feedback

---

### 4. **Pindahkan Toast ke Kanan Bawah**

**File:** `frontend/src/components/UI/Toast.jsx`

**Perubahan:**
```javascript
// SEBELUM
<div className="fixed top-4 right-4 z-[1080] flex flex-col gap-3 ...">

// SESUDAH
<div className="fixed bottom-4 right-4 z-[1080] flex flex-col-reverse gap-3 ...">
```

**Benefit:**
- ✅ Toast muncul di kanan bawah (sesuai permintaan user)
- ✅ `flex-col-reverse` membuat toast baru muncul dari bawah
- ✅ Lebih terlihat dan tidak menghalangi konten atas

---

## 📊 Perbandingan

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Multiple Clicks** | ✅ Bisa diklik berkali-kali | ❌ Disabled saat proses |
| **Loading State** | ❌ Tidak ada | ✅ Ada (text "Menyimpan...") |
| **Duplicate Data** | ✅ Terjadi | ❌ Tidak terjadi |
| **Toast Position** | Kanan atas | Kanan bawah |
| **Visual Feedback** | ❌ Tidak jelas | ✅ Jelas (disabled + text) |
| **Input Validation** | ❌ Tidak ada | ✅ Ada (catatan tidak boleh kosong) |

---

## 🎯 Komponen yang Diperbaiki

### 1. **ExpertPage** - Tambah Tenaga Ahli
- ✅ Loading state `isSaving`
- ✅ Button disabled saat saving
- ✅ Text berubah "Menyimpan..."
- ✅ Toast notification sudah ada di `addExpert()`

### 2. **TenderDetail** - Status & Catatan
- ✅ Loading state `isUpdatingStatus` untuk status
- ✅ Loading state `isSavingNote` untuk catatan
- ✅ Validasi input catatan tidak boleh kosong
- ✅ Toast notification sudah ada di `updateTenderStatus()` dan `addTenderNote()`

### 3. **ExpertDetail** - Review & History
- ✅ Loading state `isSavingReview` untuk review
- ✅ Loading state `isSavingHistory` untuk riwayat
- ✅ Toast notification sudah ada di `addReview()` dan `addHistory()`

### 4. **Toast Component**
- ✅ Posisi dipindah ke kanan bawah
- ✅ Animation dari bawah ke atas

---

## 🧪 Testing Checklist

### Test 1: Tambah Tenaga Ahli
- [ ] Klik tombol "Simpan" sekali
- [ ] Tombol berubah jadi "Menyimpan..." dan disabled
- [ ] Tidak bisa diklik lagi sampai proses selesai
- [ ] Toast muncul di kanan bawah: "Tenaga ahli berhasil ditambahkan"
- [ ] Form tertutup dan data muncul di tabel
- [ ] Tidak ada duplicate entry

### Test 2: Update Status Tender
- [ ] Ubah status tender (misal: Dipantau → Akan Diikuti)
- [ ] Select dropdown disabled saat proses
- [ ] Toast muncul di kanan bawah: "Status tender diperbarui menjadi Akan Diikuti"
- [ ] Status ter-update di UI

### Test 3: Tambah Catatan Tender
- [ ] Tulis catatan di textarea
- [ ] Klik "Tambah Catatan"
- [ ] Button berubah jadi "Menyimpan..." dan disabled
- [ ] Toast muncul di kanan bawah: "Catatan ditambahkan"
- [ ] Catatan muncul di list
- [ ] Textarea ter-clear
- [ ] Tidak ada duplicate catatan

### Test 4: Tambah Review Tenaga Ahli
- [ ] Isi form review (nama reviewer, rating, komentar)
- [ ] Klik "Simpan Review"
- [ ] Button berubah jadi "Menyimpan..." dan disabled
- [ ] Toast muncul di kanan bawah: "Review berhasil disimpan"
- [ ] Review muncul di list
- [ ] Form ter-reset
- [ ] Tidak ada duplicate review

### Test 5: Tambah Riwayat Pekerjaan
- [ ] Isi form riwayat (nama proyek, klien, tahun, dll)
- [ ] Klik "Simpan Riwayat"
- [ ] Button berubah jadi "Menyimpan..." dan disabled
- [ ] Toast muncul di kanan bawah: "Riwayat berhasil disimpan"
- [ ] Riwayat muncul di tabel
- [ ] Form ter-reset
- [ ] Tidak ada duplicate riwayat

### Test 6: Toast Position
- [ ] Lakukan action apapun yang trigger toast
- [ ] Toast muncul di **kanan bawah** layar
- [ ] Toast slide in dari kanan
- [ ] Multiple toast stack dari bawah ke atas

---

## 🔧 Pattern yang Digunakan

### Loading State Pattern
```javascript
// 1. Declare state
const [isSaving, setIsSaving] = useState(false);

// 2. Handler with guard
const handleSave = async () => {
  if (isSaving) return; // Guard clause
  
  setIsSaving(true);
  try {
    await saveData();
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    setIsSaving(false); // Always reset
  }
};

// 3. Button with disabled state
<Button 
  disabled={isSaving}
  onClick={handleSave}
>
  {isSaving ? 'Menyimpan...' : 'Simpan'}
</Button>
```

### Benefits of This Pattern:
1. **Prevent Race Conditions** - Guard clause prevents multiple simultaneous calls
2. **Visual Feedback** - User sees "Menyimpan..." text
3. **Disabled State** - Button can't be clicked during process
4. **Always Reset** - `finally` block ensures state is reset even on error
5. **Error Handling** - Catch block handles errors gracefully

---

## 📝 Toast Notification Messages

Semua toast notification sudah ada di `AppContext.jsx`:

| Action | Success Message | Error Message |
|--------|----------------|---------------|
| **Tambah Expert** | "Tenaga ahli berhasil ditambahkan" | "API expert belum tersambung. Data expert disimpan sementara di browser." |
| **Update Status** | "Status tender diperbarui menjadi {status}" | "Gagal menyimpan status ke database, data hanya tersimpan sementara." |
| **Tambah Catatan** | "Catatan ditambahkan" | "Gagal sinkronisasi catatan, hanya tersimpan lokal" |
| **Tambah Review** | "Review berhasil disimpan" | "Gagal menyimpan review ke database" |
| **Tambah History** | "Riwayat berhasil disimpan" | "Gagal menyimpan riwayat ke database" |

---

## 🎉 Hasil

Setelah implementasi ini:
- ✅ **Tidak ada duplicate data** lagi
- ✅ **Loading state** yang jelas di semua tombol save
- ✅ **Toast notification** muncul di kanan bawah
- ✅ **Visual feedback** yang jelas untuk user
- ✅ **Input validation** untuk mencegah data kosong
- ✅ **Better UX** - user tahu kapan proses sedang berjalan

---

**Tanggal:** 4 Mei 2026  
**Status:** ✅ Implemented  
**Impact:** High - Menyelesaikan masalah duplicate data dan improve UX
