# 🚀 Quick Start: User Management

## Status: ✅ SIAP DIGUNAKAN

Backend dan frontend sudah running. Tinggal konfigurasi Supabase keys!

---

## ⚡ 3 Langkah Cepat

### 1️⃣ Update Supabase Keys (5 menit)

Buka `backend/.env` dan ganti 3 baris ini:

```env
SUPABASE_ANON_KEY=<paste key dari dashboard>
SUPABASE_SERVICE_KEY=<paste key dari dashboard>
SUPABASE_JWT_SECRET=<paste secret dari dashboard>
```

**Cara ambil keys:**
1. Buka: https://supabase.com/dashboard/project/aedojcjkhorogsgwasab
2. Klik: Settings → API
3. Copy: anon public, service_role, JWT Secret

### 2️⃣ Backend Auto-Reload

Backend akan otomatis reload setelah `.env` disimpan. Cek log:
```
INFO:     Application startup complete.
```

### 3️⃣ Test di Browser

1. Buka: http://localhost:5173
2. Login sebagai **admin**
3. Klik: **Settings** (sidebar)
4. Scroll ke: **Manajemen Pengguna**
5. Klik: **Tambah User**

---

## 🎯 Test Checklist

- [ ] Buat user baru
- [ ] Edit user (nama/role)
- [ ] Hapus user
- [ ] Test sebagai guest (harus muncul warning)
- [ ] Test sebagai user biasa (harus muncul warning)

---

## ⚠️ Troubleshooting Cepat

**Error: "Supabase configuration missing"**
→ Keys belum diupdate di `backend/.env`

**User tidak muncul di list**
→ Jalankan `supabase/auth_setup.sql` di Supabase SQL Editor

**Backend tidak reload**
→ Stop dan start ulang backend

---

## 📚 Dokumentasi Lengkap

- **Setup Guide**: `USER_MANAGEMENT_SETUP.md`
- **Completion Report**: `TASK_6_USER_MANAGEMENT_COMPLETE.md`

---

## 🎉 That's It!

Update keys → Test → Done! 🚀
