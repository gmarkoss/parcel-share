# 🚂 Railway Setup Guide

## Environment Variables for Railway Backend

Copy these to your Railway backend service:

### Database Configuration
```
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=[Copy from PostgreSQL service → Variables → PGPASSWORD]
DB_DATABASE=railway
```

### Server Configuration
```
PORT=3001
NODE_ENV=production
```

### JWT Configuration
```
JWT_SECRET=HlsLo/0FdHCMaoUmp4T/GMpKk4joi5V7OuhQuAG1Y1Y=
JWT_EXPIRES_IN=7d
```

### Frontend URL (Update after Vercel deploy)
```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

---

## Step-by-Step Setup

### 1. Find Your Database Password

1. In Railway dashboard, click on your **PostgreSQL** service
2. Go to **Variables** tab
3. Find `PGPASSWORD` variable
4. Copy the value
5. Use this as your `DB_PASSWORD`

### 2. Add Environment Variables to Backend Service

1. Click on your **Backend** service in Railway
2. Click **Variables** tab
3. Click **New Variable**
4. Add each variable one by one:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DB_HOST` | `postgres` | |
| `DB_PORT` | `5432` | |
| `DB_USERNAME` | `postgres` | |
| `DB_PASSWORD` | `[copy from PostgreSQL service]` | ⚠️ Copy from DB service |
| `DB_DATABASE` | `railway` | |
| `PORT` | `3001` | |
| `NODE_ENV` | `production` | |
| `JWT_SECRET` | `HlsLo/0FdHCMaoUmp4T/GMpKk4joi5V7OuhQuAG1Y1Y=` | ⚠️ Use this generated secret |
| `JWT_EXPIRES_IN` | `7d` | |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ⚠️ Update after frontend deploy |

### 3. Configure Build Settings

1. Click on your **Backend** service
2. Go to **Settings** → **Build & Deploy**
3. Set **Root Directory** to: `backend`
4. Set **Start Command**: `npm run start:prod`
5. Save changes

### 4. Deploy

1. Click **"Deploy"** button
2. Or push to GitHub (auto-deploys if connected)
3. Watch the logs for any errors

---

## Expected Build Output

You should see:
```
> backend@0.0.1 build
> nest build

[Nest] Starting Nest application...
[TypeORM] Connected to database
[NestApplication] Nest application successfully started
🚀 Application is running on: http://0.0.0.0:3001/api
📚 API Documentation: http://0.0.0.0:3001/api/docs
```

---

## Testing Your Deployment

### 1. Get Your Backend URL

Your backend will be at:
```
https://your-backend-name.up.railway.app
```

### 2. Test the API

#### Check API Docs
Visit: `https://your-backend-name.up.railway.app/api/docs`

#### Test Signup
```bash
curl -X POST https://your-backend-name.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

Expected response:
```json
{
  "user": { ... },
  "accessToken": "..."
}
```

#### Test Health Check
```bash
curl https://your-backend-name.up.railway.app/api
```

Expected: `{"message":"Cannot GET /api"}` (this is normal)

---

## Troubleshooting

### Issue: Database Connection Failed

**Check**:
1. DB_PASSWORD matches PostgreSQL PGPASSWORD
2. Service names are correct
3. PostgreSQL service is running

**Fix**: Verify all database environment variables

### Issue: Port Already in Use

**Check**: PORT should be 3001, not auto-assigned

**Fix**: Railway auto-sets $PORT, update main.ts to use env var

### Issue: Module Not Found

**Check**: Build process completed successfully

**Fix**: Check build logs, ensure all dependencies installed

### Issue: TypeORM Synchronize

**Note**: In production, `synchronize: false` (good for safety)
TypeORM will NOT auto-create tables.

**Solution**: Either:
1. Keep synchronize: true temporarily (NOT for production)
2. Create migration files
3. Manually create schema

---

## Next Steps

1. ✅ Add environment variables to Railway
2. ✅ Deploy backend
3. ✅ Test API endpoints
4. → Deploy frontend on Vercel
5. → Update FRONTEND_URL in Railway
6. → Test complete application

---

## Database Schema (First Time Only)

Since `synchronize: false` in production, you need to run migrations or manually create tables.

### Option 1: Temporarily Enable Sync (Quick Start)
For first deployment only:
```typescript
// In database.config.ts
synchronize: true,  // ⚠️ ONLY for first deployment
```

After tables are created, set back to:
```typescript
synchronize: configService.get<string>('NODE_ENV') === 'development',
```

### Option 2: Run SQL Script (Recommended)
Connect to Railway PostgreSQL and run:
```sql
-- Get connection string from Railway PostgreSQL service
-- Copy DATABASE_URL
-- Connect using psql or DBeaver

-- Then run schema.sql (create this from your entities)
```

---

## 🎉 Success Checklist

- [ ] All environment variables set
- [ ] Backend deployed successfully
- [ ] Database connected
- [ ] API docs accessible
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Swagger documentation working

Once all checked, move to **Step 2: Deploy Frontend on Vercel**!
