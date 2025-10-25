# 🔧 Railway Database Connection Fix

## Problem
`ECONNREFUSED` error - Backend can't connect to PostgreSQL database

## Solution
I've updated the database configuration to use Railway's `DATABASE_URL` automatically.

### What Changed
- `backend/src/config/database.config.ts` now parses `DATABASE_URL` from Railway
- Falls back to individual environment variables if not available
- Code has been pushed to GitHub ✅

## Railway Environment Variables Setup

### 🔴 IMPORTANT: In Railway Dashboard

Go to your **Backend Service** → **Variables** tab:

### Required Variables

```env
# Minimal setup - Railway provides these automatically
DATABASE_URL=<Auto-provided by Railway when you connect services>

# Add these manually:
JWT_SECRET=HlsLo/0FdHCMaoUmp4T/GMpKk4joi5V7OuhQuAG1Y1Y=
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## How to Connect Services in Railway

### Step 1: Link PostgreSQL to Backend

1. In Railway dashboard, click your **Backend** service
2. Go to **Settings** → **Variables** tab
3. Look for **"Public Networking"** or **"Connect"** section
4. You should see: **"Connect to Postgres"** or similar button
5. Click it to auto-link the PostgreSQL service
6. This automatically creates `DATABASE_URL` environment variable

### Step 2: Manual Connection (If needed)

If the auto-connect doesn't work:

1. Click on your **PostgreSQL** service in Railway
2. Go to **Variables** tab
3. Copy these values:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

4. In your **Backend** service → **Variables**:
   ```
   DB_HOST=<PGHOST>
   DB_PORT=<PGPORT>
   DB_USERNAME=<PGUSER>
   DB_PASSWORD=<PGPASSWORD>
   DB_DATABASE=<PGDATABASE>
   ```

## Deployment Steps

### 1. After connecting services, Railway will auto-deploy
- Check **Logs** tab in your backend service
- Look for: `[TypeORM] Connected to database`

### 2. Test the API

Once deployed, test:
```
https://your-backend.up.railway.app/api/docs
```

### 3. Test Signup

```bash
curl -X POST https://your-backend.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

## Expected Success Log

```
[Nest] Starting Nest application...
[TypeORM] Connected to database
[NestApplication] Nest application successfully started
🚀 Application is running on: http://0.0.0.0:3001/api
📚 API Documentation: http://0.0.0.0:3001/api/docs
```

## Troubleshooting

### Issue: Still seeing ECONNREFUSED

**Solution**: 
1. Check that PostgreSQL service is running (green status)
2. Verify services are connected (backends page should show linked services)
3. Wait 2-3 minutes for Railway to propagate environment variables

### Issue: Authentication failed

**Solution**:
- Verify PGPASSWORD matches between services
- Check database credentials are correct

### Issue: Table not found

**Solution**:
- TypeORM will auto-create tables on first run (synchronize: true)
- Wait for first successful connection
- Check logs for table creation messages

## Quick Checklist

- [ ] PostgreSQL service running
- [ ] Backend service linked to PostgreSQL
- [ ] DATABASE_URL or individual DB variables set
- [ ] JWT_SECRET set
- [ ] NODE_ENV=production
- [ ] Code pushed to GitHub (latest commit)
- [ ] Deployment logs show "Connected to database"

---

## 🎉 Once Connected

Your backend will be live at:
```
https://your-backend-name.up.railway.app/api
```

API Documentation:
```
https://your-backend-name.up.railway.app/api/docs
```

Then proceed to deploy frontend on Vercel!

