# 🚀 QuickStart Guide - ParcelShare MVP

Get up and running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 20+
npm --version   # Should be 10+
docker --version  # Optional, for containerized setup
```

## Option 1: Docker (Fastest) 🐳

```bash
# 1. Navigate to project directory
cd "/Users/markodjordjevic/reMa/parcel-sharing-platform mvp"

# 2. Start everything
docker-compose up -d

# 3. Wait for services to be ready (~30 seconds)
# Check status: docker-compose logs -f

# 4. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
```

That's it! The database will be automatically created and tables synchronized.

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f backend  # Backend logs
docker-compose logs -f frontend # Frontend logs
docker-compose logs -f postgres # Database logs
```

## Option 2: Local Development 💻

### Step 1: Start PostgreSQL

**Option A: Using Docker**
```bash
docker run --name parcel-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=parcel_sharing \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**Option B: Use local PostgreSQL**
- Create database: `createdb parcel_sharing`
- Make sure it's running on port 5432

### Step 2: Start Backend

```bash
# Terminal 1
cd backend

# Install dependencies (first time only)
npm install

# Copy environment file
cp .env.example .env

# Start backend in dev mode
npm run start:dev

# Backend will be at http://localhost:3001/api
```

### Step 3: Start Frontend

```bash
# Terminal 2
cd frontend

# Install dependencies (first time only)
npm install

# Copy environment file
cp .env.local.example .env.local

# Start frontend in dev mode
npm run dev

# Frontend will be at http://localhost:3000
```

## First Steps 👣

### 1. Create an Account
- Go to http://localhost:3000
- Click "Sign Up"
- Enter your details
- You'll be redirected to the dashboard

### 2. Create a Parcel Request
- Click "Send a Parcel" or go to `/parcels/create`
- Fill in:
  - From: Amsterdam, Netherlands (52.3676, 4.9041)
  - To: Brussels, Belgium (50.8503, 4.3517)
  - Size: Small
  - Desired Pickup: Tomorrow 10:00
  - Desired Delivery: Tomorrow 18:00
  - Reward: €10 (optional)
- Click "Create Parcel Request"

### 3. Create a Trip Offer
- Click "Offer a Trip" or go to `/trips/create`
- Fill in:
  - From: Amsterdam, Netherlands (52.3676, 4.9041)
  - To: Brussels, Belgium (50.8503, 4.3517)
  - Transport: Car
  - Departure: Tomorrow 09:00
  - Arrival: Tomorrow 12:00
  - Capacity: 2 parcels
- Click "Create Trip Offer"

### 4. View Matches
- Go to your parcel details
- Scroll to see "Matching Trips" section
- Or go to trip details to see "Matching Parcels"
- The system automatically scores matches (0-100)

### 5. Accept a Delivery
- As a traveler, view a matching parcel
- Click "Accept Parcel"
- Parcel status changes to "accepted"
- Both sender and carrier get notifications

## Testing the API 🔧

### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create Parcel (with token)
```bash
TOKEN="your-jwt-token"

curl -X POST http://localhost:3001/api/parcels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fromLocation": "Amsterdam, Netherlands",
    "toLocation": "Brussels, Belgium",
    "fromLat": 52.3676,
    "fromLng": 4.9041,
    "toLat": 50.8503,
    "toLng": 4.3517,
    "size": "small",
    "desiredPickupDate": "2024-12-20T10:00:00Z",
    "desiredDeliveryDate": "2024-12-20T18:00:00Z",
    "rewardAmount": 10
  }'
```

### Get All Parcels
```bash
curl http://localhost:3001/api/parcels?status=requested \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting 🔍

### Backend won't start
- **Issue**: Database connection error
- **Fix**: Make sure PostgreSQL is running on port 5432
- **Check**: `psql -U postgres -l` (should list databases)

### Frontend can't connect to backend
- **Issue**: CORS or connection refused
- **Fix**: Make sure backend is running on port 3001
- **Check**: `curl http://localhost:3001/api` should return something

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different ports:
# Backend: PORT=3002 npm run start:dev
# Frontend: PORT=3001 npm run dev
```

### Database tables not created
- Backend auto-creates tables in development mode
- Check logs: `npm run start:dev` should show "Database connected"
- Manual check: `psql -U postgres parcel_sharing -c "\dt"`

### Can't sign in after creating account
- Clear localStorage: Browser DevTools > Application > Local Storage > Clear
- Check backend logs for authentication errors
- Verify JWT_SECRET is set in backend .env

## Running Tests 🧪

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage
```

### Frontend E2E Tests
```bash
cd frontend
npx playwright install    # First time only
npm run test:e2e          # Run tests
npm run test:e2e:ui       # Interactive UI mode
```

## Development Tips 💡

### Watch Database Changes
```bash
# Connect to database
docker exec -it parcel-sharing-db psql -U postgres parcel_sharing

# View tables
\dt

# View users
SELECT id, email, name FROM users;

# View parcels
SELECT id, "fromLocation", "toLocation", status FROM parcels;

# Exit
\q
```

### Debug Backend
- Add breakpoints in VSCode
- Use `console.log()` in services
- Check logs: backend terminal shows all SQL queries in dev mode

### Debug Frontend
- Use React DevTools extension
- Check Network tab for API calls
- Use `console.log()` in components
- Auth state: Check AuthContext provider

### Hot Reload
- Backend: Automatically reloads on file changes (NestJS watch mode)
- Frontend: Automatically reloads on file changes (Next.js fast refresh)

## What's Next? 📚

1. **Read the docs**:
   - `README.md` - Full documentation
   - `ARCHITECTURE.md` - System design details

2. **Explore the code**:
   - Backend: `backend/src/` modules
   - Frontend: `frontend/app/` pages

3. **Add features**:
   - Photo uploads for parcels
   - Real-time chat
   - Payment integration
   - Mobile app

4. **Deploy**:
   - Backend to Render/Railway
   - Frontend to Vercel
   - Database to managed PostgreSQL

## Need Help? 🆘

- Check `README.md` for detailed documentation
- Review `ARCHITECTURE.md` for system design
- Check backend logs for API errors
- Check browser console for frontend errors
- Create an issue on GitHub

---

**Happy Coding! 🎉**

