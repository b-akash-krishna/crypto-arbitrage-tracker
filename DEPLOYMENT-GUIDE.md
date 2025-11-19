# Deployment Guide - PrimeTrade AI

Deploy your PrimeTrade AI application to production in 3 simple steps!

---

## 📋 Prerequisites

- GitHub account (for code hosting)
- Vercel account (free tier available)
- Railway or Render account (for backend)
- PostgreSQL database

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Push to GitHub
```bash
Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: PrimeTrade AI v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crypto-arbitrage-tracker.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Click **New Project**
3. Select your GitHub repository
4. Configure:
   - **Framework:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
5. Add Environment Variables:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```
6. Click **Deploy**

### Step 3: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Your frontend is now live!** 🎉

---

## 🔧 Backend Deployment (Railway/Render)

### Option A: Deploy on Railway

#### Step 1: Prepare Backend

Create `backend/Procfile`:
```bash
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Create `backend/runtime.txt`:
```bash
python-3.10.12
```

#### Step 2: Deploy

1. Visit [railway.app](https://railway.app)
2. Click **New Project**
3. Select **GitHub Repo**
4. Choose your repository
5. Configure:
   - **Root Directory:** `backend`
   - **Python Version:** 3.10
6. Add Environment Variables:
```bash
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-secret-key-here
ENVIRONMENT=production
```
7. Click **Deploy**

**Backend URL:** `https://your-project.railway.app`

---

### Option B: Deploy on Render

#### Step 1: Prepare Backend

Create `backend/build.sh`:
```bash
pip install -r requirements.txt
```

Create `backend/start.sh`:
```bash
#!/bin/bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Step 2: Deploy

1. Visit [render.com](https://render.com)
2. Click **New Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name:** `primetrade-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `./build.sh`
   - **Start Command:** `./start.sh`
   - **Environment:** Python 3.10
5. Add Environment Variables:
```bash
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
ENVIRONMENT=production
```
6. Click **Create Web Service**

**Backend URL:** `https://primetrade-backend.onrender.com`

---

## 🗄️ Database Setup

### PostgreSQL on Render

1. In Render Dashboard, click **New PostgreSQL**
2. Configure:
- **Name:** `primetrade-db`
- **Database:** `arbitrage_db`
- **User:** `admin`
3. Copy connection string
4. Add to backend as `DATABASE_URL`

### Alternative: Supabase

1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Add to backend environment

---

## ✅ Post-Deployment Checklist

### Frontend
- [ ] Domain working on Vercel
- [ ] Environment variables set
- [ ] API endpoint updated
- [ ] HTTPS enabled (automatic)
- [ ] Performance optimized

### Backend
- [ ] API responding on production URL
- [ ] Database connected
- [ ] CORS configured for frontend domain
- [ ] Environment variables secure
- [ ] Logs accessible

### Testing
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads data
- [ ] Alerts CRUD operations work
- [ ] Real-time data updates working

---

## 🔒 Security Configuration

### CORS Setup (Backend)

Update `backend/app/main.py`:
```bash
app.add_middleware(
CORSMiddleware,
allow_origins=[
"https://yourdomain.vercel.app",
"https://yourdomain.com",
],
allow_credentials=True,
allow_methods=[""],
allow_headers=[""],
)
```

### Environment Variables (Production)

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql://...
SECRET_KEY=use-strong-random-key
ENVIRONMENT=production
DEBUG=False
```

Generate secure secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📊 Monitoring & Maintenance

### View Logs

**Vercel:**
- Dashboard → Project → Deployments → View logs

**Railway:**
- Project → Logs tab

**Render:**
- Service → Logs tab

### Automatic Deployments

Both Vercel and Railway/Render support automatic deployments on git push:
```bash
git add .
git commit -m "Production fix"
git push origin main

Automatic deployment triggered!
```
---

## 🚀 Performance Optimization

### Frontend Optimization

1. **Image Optimization:** Next.js Image component
2. **Code Splitting:** Automatic via Next.js
3. **Caching:** Static generation for public pages
4. **CDN:** Vercel edge network

### Backend Optimization

1. **Database Indexing:** Add indexes on frequently queried columns
2. **Caching:** Redis for market data (future enhancement)
3. **Rate Limiting:** Protect against abuse
4. **Compression:** gzip enabled

---

## 📈 Scaling Strategy

### Phase 1: Current (Small Users)
- Single Render instance
- PostgreSQL on Render
- Vercel default

### Phase 2: Growing (100+ Users)
- Multiple backend instances (auto-scaling)
- Dedicated PostgreSQL
- Redis cache layer
- CDN for static assets

### Phase 3: Production (1000+ Users)
- Kubernetes deployment
- Load balancing
- Database replication
- Microservices architecture

---

## 🆘 Troubleshooting

### Frontend not connecting to backend
```bash
Check CORS in backend
Verify API URL in frontend .env
Check network tab in browser DevTools
```

### Database connection error
```bash
Verify DATABASE_URL format
Check PostgreSQL is running
Test connection: psql $DATABASE_URL
```

### Slow performance
```bash
Check Vercel Analytics
Review backend logs
Profile with DevTools
Enable caching
```

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Next.js Docs:** https://nextjs.org/docs

---

**Your app is now in production! 🎉**
