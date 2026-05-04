# Deployment Guide - TenderHub LSI

## 🌍 **Environment Setup**

Aplikasi ini menggunakan environment-based configuration untuk memisahkan development dan production.

### **File Structure**
```
frontend/
├── .env                    # Default fallback (committed to git)
├── .env.local             # Development override (NOT committed)
├── .env.production        # Production config (committed to git)
└── .env.example           # Template untuk team
```

### **Priority Order**
Vite akan load environment variables dengan urutan:
1. `.env.production` (saat `npm run build`)
2. `.env.local` (saat `npm run dev`)
3. `.env` (fallback)

---

## 🔧 **Development Setup**

### **1. Clone Repository**
```bash
git clone https://github.com/spatiallity/tenderhub-lsi.git
cd tenderhub-lsi/lsi-tender-intel
```

### **2. Setup Backend**
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env (if needed)
cp .env.example .env

# Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend akan menggunakan **SQLite lokal** (`lsi_tender.db`) untuk development.

### **3. Setup Frontend**
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend akan otomatis connect ke `http://localhost:8000/api/v1` (dari `.env.local`).

### **4. Access Application**
- Frontend: http://localhost:5173/
- Backend API: http://localhost:8000/api/v1
- API Docs: http://localhost:8000/docs

---

## 🚀 **Production Deployment**

### **Current Production Setup**

#### **Backend (Hugging Face Space)**
- URL: https://spatiallity-tenderhub-api.hf.space
- Database: Supabase PostgreSQL
- Auto-deploy: Push ke GitHub → Hugging Face Space auto-deploy

#### **Frontend (Vercel/Netlify)**
- Build command: `npm run build`
- Output directory: `dist`
- Environment: `.env.production` akan digunakan otomatis

---

## 📝 **Environment Variables**

### **Frontend (.env.production)**
```env
VITE_API_BASE_URL=https://spatiallity-tenderhub-api.hf.space/api/v1
```

### **Backend (.env - Production)**
```env
DATABASE_URL=postgresql+asyncpg://[user]:[password]@[supabase-host]/postgres
INAPROC_API_KEY=your_api_key_here
INAPROC_BASE_URL=https://data.inaproc.id
USE_DUMMY_DATA=false
CACHE_TTL_MINUTES=15
CORS_ORIGINS=https://your-frontend-domain.com,https://tenderhub.vercel.app
```

---

## 🔄 **Deployment Workflow**

### **Scenario 1: Deploy Backend Changes**

1. **Test Locally**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin main
   ```

3. **Hugging Face Space Auto-Deploy**
   - Hugging Face akan otomatis detect changes
   - Build & deploy backend baru
   - Database Supabase tetap terhubung

### **Scenario 2: Deploy Frontend Changes**

1. **Test Locally**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Build Production**
   ```bash
   npm run build
   # Test production build locally
   npm run preview
   ```

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin main
   ```

4. **Vercel/Netlify Auto-Deploy**
   - Platform akan otomatis detect changes
   - Build dengan `.env.production`
   - Deploy ke production URL

### **Scenario 3: Tambah Data di Production**

**Cara 1: Via Frontend Production**
1. Buka https://your-production-url.com
2. Login sebagai admin
3. Tambah data via UI
4. Data akan masuk ke Supabase

**Cara 2: Via Backend API Directly**
```bash
curl -X POST https://spatiallity-tenderhub-api.hf.space/api/v1/experts \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "John Doe",
    "no_hp": "08123456789",
    "instansi": "PT SUCOFINDO",
    "keahlian": ["Fisika", "Kimia"],
    "availability": "Tersedia",
    "subporto": ["SDA"]
  }'
```

**Cara 3: Via Supabase Dashboard**
1. Login ke Supabase dashboard
2. Buka table `expert`
3. Insert data manual via SQL atau UI

---

## 🗄️ **Database Management**

### **Development (SQLite)**
```bash
# Location
backend/lsi_tender.db

# View data
sqlite3 backend/lsi_tender.db
> SELECT * FROM expert;
> .quit

# Reset database
rm backend/lsi_tender.db
# Restart backend to recreate
```

### **Production (Supabase)**
```bash
# Connection string
postgresql+asyncpg://[user]:[password]@[host]/postgres

# Access via Supabase Dashboard
https://app.supabase.com/project/[your-project-id]

# Run migrations
cd backend
alembic upgrade head
```

---

## 🔐 **Security Best Practices**

### **1. Environment Variables**
- ✅ **NEVER** commit `.env.local` (contains local secrets)
- ✅ **DO** commit `.env.production` (contains public production URLs)
- ✅ **DO** commit `.env.example` (template without secrets)

### **2. API Keys**
```env
# ❌ BAD - Hardcoded in code
const API_KEY = "sk_live_123456789";

# ✅ GOOD - From environment
const API_KEY = import.meta.env.VITE_INAPROC_API_KEY;
```

### **3. CORS Configuration**
```python
# Backend - Only allow specific origins
CORS_ORIGINS=https://tenderhub.vercel.app,https://tenderhub-staging.vercel.app
```

---

## 📊 **Monitoring & Debugging**

### **Check Backend Health**
```bash
curl https://spatiallity-tenderhub-api.hf.space/api/health
# Response: {"status": "ok", "mode": "production"}
```

### **Check Frontend API Connection**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Add expert → Check request to `/api/v1/experts`
4. Verify request goes to correct URL

### **Common Issues**

#### **Issue 1: Data tidak masuk ke Supabase**
**Cause:** Frontend masih point ke localhost
**Fix:** 
```bash
# Check frontend .env
cat frontend/.env.production
# Should be: VITE_API_BASE_URL=https://spatiallity-tenderhub-api.hf.space/api/v1

# Rebuild
npm run build
```

#### **Issue 2: CORS Error**
**Cause:** Frontend domain tidak di-allow di backend
**Fix:**
```env
# Backend .env
CORS_ORIGINS=https://your-new-domain.com,https://tenderhub.vercel.app
```

#### **Issue 3: 500 Internal Server Error**
**Cause:** Database connection issue
**Fix:**
```bash
# Check backend logs di Hugging Face Space
# Verify DATABASE_URL di environment variables
```

---

## 🧪 **Testing Production Locally**

### **Test Production Build**
```bash
cd frontend

# Build with production env
npm run build

# Preview production build
npm run preview
# Access: http://localhost:4173/

# Should connect to Hugging Face Space API
```

### **Test Backend with Production Database**
```bash
cd backend

# Temporarily use production DATABASE_URL
export DATABASE_URL="postgresql+asyncpg://[user]:[password]@[host]/postgres"

# Run backend
uvicorn app.main:app --reload

# Test API
curl http://localhost:8000/api/v1/experts
```

---

## 📦 **Build & Deploy Commands**

### **Frontend**
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

### **Backend**
```bash
# Development
uvicorn app.main:app --reload

# Production (with gunicorn)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Docker
docker build -t tenderhub-backend .
docker run -p 8000:8000 tenderhub-backend
```

---

## 🔄 **Migration Strategy**

### **When to Migrate**
- Adding new tables
- Changing column types
- Adding indexes

### **How to Migrate**
```bash
cd backend

# Create migration
alembic revision --autogenerate -m "add expert table"

# Review migration file
cat alembic/versions/[hash]_add_expert_table.py

# Apply to local
alembic upgrade head

# Apply to production (via Hugging Face Space)
# Migrations will run automatically on deploy
```

---

## 📚 **Additional Resources**

- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **Supabase Docs:** https://supabase.com/docs
- **Hugging Face Spaces:** https://huggingface.co/docs/hub/spaces

---

## 🎯 **Quick Reference**

| Environment | Frontend URL | Backend URL | Database |
|-------------|-------------|-------------|----------|
| **Development** | http://localhost:5173 | http://localhost:8000 | SQLite (local) |
| **Production** | https://tenderhub.vercel.app | https://spatiallity-tenderhub-api.hf.space | Supabase (PostgreSQL) |

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (uses `.env.local`) |
| `npm run build` | Build for production (uses `.env.production`) |
| `npm run preview` | Preview production build locally |
| `uvicorn app.main:app --reload` | Start backend development server |

---

**Last Updated:** 4 Mei 2026  
**Maintainer:** TenderHub LSI Team
