# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product context

**TenderHub LSI** — internal tender-management web app for PT SUCOFINDO's LSI division. Indonesian-language UI. Two user populations: **SBU Pusat** (HQ) and **Cabang** (regional branches), plus **Admin**. Tracks public tenders + RUP (Rencana Umum Pengadaan) data sourced from INAPROC, plus an internal expert (Tenaga Ahli) roster and a CV generator.

`TASKS.md` at repo root is the active backlog — read it before starting any feature work; do not invent overlapping work.

## Commands

### Backend (FastAPI, Python 3.11)
```powershell
# from repo root, full stack via Docker (Postgres + backend + frontend hot reload)
docker-compose up

# local backend only (uses .env)
.\restart_backend.ps1
# or
.\run_backend_local.bat

# alembic migrations (cwd = backend\)
alembic revision --autogenerate -m "msg"
alembic upgrade head
```

### Frontend (React 18 + Vite, cwd = frontend\)
```powershell
npm install
npm run dev          # http://localhost:5173, proxies /api -> :8000
npm run build
npm run lint         # ESLint, --max-warnings 0
npm run preview
```

### RTK token-saving wrappers
`.clinerules` mandates `rtk <cmd>` for git/grep/ls/find/cat/test/build to compress tool output ~60-90%. Use `rtk git status`, `rtk git diff`, etc. — NOT raw git.

## Architecture

### Stack split

| Layer | Tech | Notes |
|---|---|---|
| Backend API | FastAPI + SQLAlchemy 2 async + asyncpg | `backend/app/`, port 8000 (local) / 7860 (HF Spaces) |
| ORM models | only Expert, Keyword, TenderWatchlist, TenderCache | Tender + RUP themselves are NOT stored in DB |
| Migrations | Alembic for SQLAlchemy tables | `backend/alembic/versions/` |
| Auth + profiles | **Supabase** (separate from FastAPI DB) | profiles + RLS, see `supabase/auth_setup.sql` |
| Supabase schema changes | **raw SQL files in `supabase/*.sql`**, run manually via Supabase dashboard SQL editor | NOT `supabase/migrations/` — there's no Supabase CLI workflow here |
| Tender/RUP data source | INAPROC public API via `app/services/inaproc.py`, with dummy fallback | toggle via `USE_DUMMY_DATA` env |
| Frontend | React 18, Vite, Tailwind, TanStack Query, react-router v6 | `frontend/src/` |
| Frontend auth | `@supabase/supabase-js` direct from browser | `src/contexts/AuthContext.jsx` |

### Critical: dual data plane

Frontend talks to **two backends**:
1. **FastAPI** at `/api/v1/*` (proxied in dev) — for tender/rup/expert/CV/watchlist endpoints.
2. **Supabase** directly via JS client — for auth, profiles table, audit logs, contact persons, hide lists. Many SQL files in `supabase/` create tables the FastAPI backend never touches.

When adding a feature, decide which side owns the table. Don't duplicate. The user/role/profile data lives **only in Supabase** — there is no `User` SQLAlchemy model.

### Auth flow

- Supabase issues HS256 JWT signed with `SUPABASE_JWT_SECRET`.
- Backend verifies via `app/core/auth.py` (`get_current_user`, `require_manager`).
- `require_manager` re-fetches the role via Supabase REST against `profiles` — backend never trusts a role claim from the JWT itself.
- Roles: `admin` / `manager` / `user` / `guest` (guest is frontend-only, sessionStorage flag).
- **`SKIP_AUTH=true`** in backend `.env` short-circuits all auth checks — used in dev/dummy mode.
- **Frontend `import.meta.env.DEV` auto-logs in as admin** (`AuthContext.jsx`) — no real Supabase call when running `npm run dev`. Login form is bypassed entirely. Don't be confused that the login page works in prod but never appears in dev.

### Tender / RUP model

- There's no `Tender` table. INAPROC is queried per-request, results cached in `TenderCache` (raw JSON) and indexed by `kd_tender`.
- **Internal state** (Status Internal, catatan, assigned PIC, expert assignments) lives in `TenderWatchlist`, keyed by `kd_tender`. A "claimed" tender = a watchlist row exists. Watchlist row is the closest thing to a tender record.
- TASKS.md Section 1 introduces branch-exclusive claims — that's a `unit_kerja` foreign key on `TenderWatchlist` (and equivalent for RUP). Don't rebuild watchlist; extend it.
- Status Internal valid values: `Dipantau`, `Akan Diikuti`, `Sudah Diikuti`, `Menang`, `Kalah`, `Tidak Relevan`. Save-confirm UX in tables is intentional — preserve it.

### Dummy data sources (two of them, do not desync)

- `backend/app/services/dummy_data.py` — large Python list `EXPERTS_RAW`, used by FastAPI when `USE_DUMMY_DATA=true` and on first-boot expert seed in `app/main.py:seed_data()`.
- `frontend/src/data/demoData.js` and `rupDummy.js` — used by frontend when API is unavailable / for guest mode preview.

If you add fields to a dummy entity, update both. New seed data per TASKS.md Section 6 should extend, not replace.

### CV generator

- Templates: `TEMPLATE_CV_EXPERT.docx` at repo root (and copied to backend WORKDIR via Dockerfile).
- Endpoints in `app/api/v1/cv_generator_dynamic.py` (legacy `cv_generator.py` retained, `main.py` aliases the dynamic one as `cv_generator`).
- DOCX → PDF conversion needs LibreOffice headless — installed in `Dockerfile`, **not available locally** unless you install it. PDF endpoint will 500 without it.

### Frontend conventions

- Pages are lazy-loaded in `App.jsx`. New page = add lazy import + Suspense route.
- Global state via `src/store/AppContext.jsx` (large; ~38KB) — stash domain state and shared selectors there. TanStack Query handles server state.
- Vendor chunks are manually split in `vite.config.js` (`manualChunks`) — adding a heavy lib? Add it to the chunk map.
- Tailwind for all styling; no CSS modules. Shared UI primitives in `components/UI/`.

### Submodules

`lsi-tender-intel/` and `hf-space/` appear in `ls` and git status as nested mirrors of this repo (deployment targets). The `m` flag in `git status` means submodule has uncommitted changes. Don't edit inside them unless intentionally working on a deployment artifact — edits should land in the canonical `backend/`, `frontend/`, `supabase/` paths.

### `.kiro/specs/`

Holds Kiro-format spec docs (e.g. `ui-ux-improvement/`). Treat as design context, not source of truth — TASKS.md is authoritative for active work.

## Gotchas

- **No JIT, no prepared statements** in `database.py` Postgres config — required for Supabase pooler compatibility. Don't "optimize" these away.
- **CORS is wide-open** (`allow_origins=["*"]`, credentials false). Intentional for HF Spaces deployment; do not toggle credentials true without rethinking.
- Repo root has many `*.md` status/post-mortem files (`*_FIX.md`, `*_SUMMARY.md`, `PHASE_*_COMPLETION_REPORT.md`). They are historical, not current docs. Don't add more — fold notes into PR descriptions.
- Lots of one-off `.py`/`.ps1`/`.sql` scripts in `backend/` and root (`add_experts_*`, `cleanup_*`, `complete_*`, `fill_*`). They are ad-hoc data-fix tools, not part of the runtime — don't import from them.
- Duplicate Excel files (`~$*.docx`, `Data Pegawai SBU LSI.xlsx`, `RUP - Cari Paket Penyedia.xlsx`) at repo root are user uploads — leave alone.
- `.env.production` is committed and copied into the Docker image as `.env` — be careful what lands there.
