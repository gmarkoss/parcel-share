# 🚀 Deploy ParcelShare MVP - Free Hosting Guide

## Overview

This guide shows you how to deploy ParcelShare MVP to free hosting platforms. The app needs:
- **Backend**: NestJS API server
- **Frontend**: Next.js web app
- **Database**: PostgreSQL

## 🎯 Best Free Hosting Options

### Option 1: Railway (Recommended) ⭐

**Why Choose Railway?**
- ✅ Completely free tier ($5 credit/month)
- ✅ PostgreSQL included
- ✅ Automatic deploys from GitHub
- ✅ Custom domains
- ✅ Simple setup

**Cost**: FREE (up to 500 hours/month)

**Setup Steps:**

1. **Update CORS in Backend**
   ```typescript
   // backend/src/main.ts
   app.enableCors({
     origin: ['https://your-app.railway.app', 'https://your-frontend.vercel.app'],
     credentials: true,
   });
   ```

2. **Deploy Backend**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Select `/backend` as the root directory
   - Add PostgreSQL service
   - Set environment variables:
     ```
     PORT=3001
     DB_HOST=postgres
     DB_PORT=5432
     DB_USERNAME=postgres
     DB_PASSWORD=[auto-generated]
     DB_DATABASE=railway
     JWT_SECRET=your-secret-key-here
     NODE_ENV=production
     ```

3. **Deploy Frontend**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
     ```
   - Deploy!

**Total Cost**: FREE

---

### Option 2: Render + Vercel

**Why Choose Render?**
- ✅ Free PostgreSQL database
- ✅ Free backend hosting
- ✅ Automatic SSL
- ✅ No credit card needed (for free tier)

**Cost**: FREE (with limitations)

**Setup Steps:**

1. **Deploy Database (Render)**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New +" → "PostgreSQL"
   - Name: `parcel-sharing-db`
   - Create database
   - Copy connection string

2. **Deploy Backend (Render)**
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Settings:
     - Name: `parcel-sharing-backend`
     - Root Directory: `backend`
     - Runtime: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm run start:prod`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=10000
     DB_HOST=[from database]
     DB_PORT=5432
     DB_USERNAME=[from database]
     DB_PASSWORD=[from database]
     DB_DATABASE=[from database]
     JWT_SECRET=your-secret-key
     JWT_EXPIRES_IN=7d
     ```
   - Add Custom Domain (optional)

3. **Deploy Frontend (Vercel)**
   - Go to [vercel.com](https://vercel.com)
   - Import repository
   - Root directory: `frontend`
   - Environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://parcel-sharing-backend.onrender.com/api
     ```
   - Deploy!

**Total Cost**: FREE (with 15-minute sleep on free tier)

---

### Option 3: Fly.io (No Sleep!)

**Why Choose Fly.io?**
- ✅ No sleeping for free tier
- ✅ PostgreSQL included
- ✅ Global deployment
- ✅ Persistent volumes

**Cost**: FREE (with usage limits)

**Setup Steps:**

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   fly launch --name parcel-sharing-backend
   # Follow prompts, select PostgreSQL
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   fly launch --name parcel-sharing-frontend
   ```

**Total Cost**: FREE (up to certain limits)

---

## 🔧 Required Configuration Changes

### 1. Update Backend CORS

Edit `backend/src/main.ts`:

```typescript
// Update CORS to allow your frontend domain
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://your-app.vercel.app',
    'https://your-app.netlify.app',
  ],
  credentials: true,
});
```

### 2. Update Frontend API URL

Edit `frontend/lib/api.ts` or set environment variable:

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});
```

### 3. Environment Variables

**Backend:**
```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=parcel_sharing

JWT_SECRET=change-this-to-a-random-secret-in-production
JWT_EXPIRES_IN=7d
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

---

## 🚀 Quick Deploy to Railway (Step-by-Step)

### Step 1: Update CORS

```bash
# Edit backend/src/main.ts
# Add your Railway domain to origin array
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### Step 3: Deploy Backend on Railway

1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repo → "Deploy"
5. In settings, set Root Directory to `backend`
6. Add PostgreSQL service
7. Copy database credentials
8. Add environment variables in settings
9. Get your backend URL (e.g., `backend-production.up.railway.app`)

### Step 4: Deploy Frontend on Vercel

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. "Add New Project"
4. Import your repo
5. Configure:
   - Root Directory: `frontend`
   - Environment Variable: `NEXT_PUBLIC_API_URL` = `https://your-backend-url/api`
6. Deploy!

### Step 5: Update Backend CORS (Again)

Add your Vercel URL to CORS origins in `backend/src/main.ts`, commit and push.

---

## 🔒 Security Best Practices

### 1. Use Strong JWT Secret

```bash
# Generate a random secret
openssl rand -base64 32
```

### 2. Enable HTTPS

Most platforms do this automatically, but verify your site has `https://`

### 3. Database Security

- Never commit database credentials
- Use environment variables
- Rotate passwords regularly

### 4. CORS Configuration

Only allow your frontend domain:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
});
```

---

## 📊 Platform Comparison

| Feature | Railway | Render | Fly.io | Vercel |
|---------|---------|--------|--------|--------|
| **Free Tier** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **PostgreSQL** | ✅ Included | ✅ Included | ✅ Included | ❌ External |
| **No Sleep** | ✅ No | ⚠️ 15min | ✅ Yes | ✅ Yes |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ⚠️ Manual | ✅ Yes |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **SSL** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Best For** | Backend + DB | Backend + DB | Always-on | Frontend |

---

## 🎯 Recommended Deployment Architecture

**Railway + Vercel** (My Choice):
- Railway: Backend + Database
- Vercel: Frontend
- Total Cost: **FREE**

Benefits:
- Railway's PostgreSQL is easy to set up
- Vercel's frontend hosting is fast and global
- Both auto-deploy from GitHub
- Both have excellent free tiers

---

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

1. Push to GitHub → Auto-deploys
2. Environment variables stored securely
3. Roll back with one click
4. Preview deployments for PRs

---

## 📈 Scaling Up (When You Grow)

When your app gets popular:

1. **Upgrade to Railway Pro** ($5/month)
   - More resources
   - No limits
   - Better performance

2. **Add Monitoring**
   - Sentry for error tracking
   - Analytics for usage

3. **Database Backups**
   - Automated backups
   - Point-in-time recovery

---

## 🐛 Troubleshooting

### Problem: Database Connection Error

**Solution:**
- Check environment variables are correct
- Verify database is running
- Check network connectivity

### Problem: CORS Error

**Solution:**
- Update CORS origins in backend
- Add your frontend domain
- Restart backend

### Problem: Frontend Can't Reach Backend

**Solution:**
- Check `NEXT_PUBLIC_API_URL` is set
- Verify backend URL is correct
- Check backend is running
- Verify CORS settings

---

## ✅ Deployment Checklist

Before deploying:

- [ ] Update CORS origins in `backend/src/main.ts`
- [ ] Set strong JWT_SECRET
- [ ] Add environment variables
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend
- [ ] Test locally first
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Deploy backend first
- [ ] Get backend URL
- [ ] Update frontend env var
- [ ] Deploy frontend
- [ ] Test the deployed app
- [ ] Add custom domain (optional)

---

## 🌐 After Deployment

Your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app/api`
- **API Docs**: `https://your-backend.railway.app/api/docs

Share it with the world! 🚀

---

## 💡 Tips

1. **Start with Railway** - Easiest to set up
2. **Use Vercel for Frontend** - Best Next.js support
3. **Monitor Usage** - Keep within free tier limits
4. **Test Deployments** - Use preview URLs
5. **Backup Database** - Regular exports

---

## 🎉 You're Ready!

Follow the Railway + Vercel setup above for a free, always-on deployment of ParcelShare MVP.

**Questions?** Check the documentation:
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Fly.io: https://fly.io/docs
