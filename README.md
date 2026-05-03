---
title: Spatiallity TenderHub API
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# LSI TenderHub — Full-Stack Application

Aplikasi monitoring tender INAPROC untuk **SBU LSI PT Sucofindo**, dikonversi dari mockup HTML statis menjadi full-stack web application.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python 3.11 + FastAPI + SQLAlchemy Async |
| Database | PostgreSQL 15 |
| Infra | Docker Compose |

---

## Cara Menjalankan

### Opsi A: Docker Compose (Rekomendasi)

Pastikan Docker Desktop for Windows sudah terinstall dan running.

```bash
cd lsi-tender-intel
docker compose up --build
```

Akses:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Opsi B: Manual (Tanpa Docker)

**1. PostgreSQL** — Pastikan PostgreSQL terinstall dan running, lalu buat database:
```sql
CREATE USER lsi WITH PASSWORD 'lsi_password';
CREATE DATABASE lsi_tender OWNER lsi;
```

**2. Backend**:
```bash
cd lsi-tender-intel/backend
pip install -r requirements.txt

# Edit .env — ubah DATABASE_URL dari db:5432 ke localhost:5432
# DATABASE_URL=postgresql+asyncpg://lsi:lsi_password@localhost:5432/lsi_tender

uvicorn app.main:app --reload --port 8000
```

**3. Frontend** (terminal baru):
```bash
cd lsi-tender-intel/frontend
npm install
npm run dev
```

---

## Konfigurasi

### Backend `.env`

```env
DATABASE_URL=postgresql+asyncpg://lsi:lsi_password@localhost:5432/lsi_tender
INAPROC_API_KEY=            # ← Kosongkan jika belum punya API key
USE_DUMMY_DATA=true          # ← Set false setelah memiliki API key INAPROC
CORS_ORIGINS=http://localhost:5173
```

### Cara Mendapatkan INAPROC API Key

1. Daftar di https://data.inaproc.id
2. Setelah mendapat API Key, isi di `backend/.env`:
   ```
   INAPROC_API_KEY=your_key_here
   USE_DUMMY_DATA=false
   ```
3. Restart backend service

---

## Struktur Folder

```
lsi-tender-intel/
├── frontend/               # React 18 + Vite
│   └── src/
│       ├── components/     # UI, Layout, Tender, Expert, Dashboard
│       ├── pages/          # Dashboard, Tender, RUP, Expert, Settings
│       ├── hooks/          # React Query hooks
│       ├── services/       # Axios api.js
│       ├── store/          # AppContext (keywords, sidebar, toast)
│       └── utils/          # format.js, relevance.js
├── backend/                # FastAPI + PostgreSQL
│   └── app/
│       ├── api/v1/         # tender, rup, expert, keyword, watchlist
│       ├── core/           # config.py, database.py
│       ├── models/         # SQLAlchemy models
│       ├── schemas/        # Pydantic schemas
│       └── services/       # inaproc.py, relevance.py, dummy_data.py
└── docker-compose.yml
```

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/tender/search` | Cari tender + relevance score |
| GET | `/api/v1/rup/search` | Pipeline RUP |
| GET | `/api/v1/experts/` | Daftar Tenaga Ahli |
| POST | `/api/v1/experts/` | Tambah Tenaga Ahli |
| GET | `/api/v1/keywords/` | Daftar keyword aktif |
| POST | `/api/v1/keywords/` | Tambah keyword |
| PUT | `/api/v1/keywords/{id}` | Toggle aktif/nonaktif keyword |
| DELETE | `/api/v1/keywords/{id}` | Hapus keyword |
| GET | `/api/v1/watchlist/` | Daftar watchlist |
| POST | `/api/v1/watchlist/` | Tambah ke watchlist |
| GET | `/api/health` | Health check |
| GET | `/docs` | Swagger UI Dokumentasi API |
