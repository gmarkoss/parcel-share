# 🧪 Testing Guide - Verify Your ParcelShare MVP Works

## Quick Smoke Test (5 minutes)

### Step 1: Start the Application

```bash
cd "/Users/markodjordjevic/reMa/parcel-sharing-platform mvp"
docker-compose up -d
```

**Expected Output:**
```
Creating parcel-sharing-db ... done
Creating parcel-sharing-backend ... done
Creating parcel-sharing-frontend ... done
```

### Step 2: Verify Services Are Running

```bash
docker-compose ps
```

**Expected Output:**
All services should show "Up" status
```
NAME                      STATUS
parcel-sharing-db         Up (healthy)
parcel-sharing-backend    Up
parcel-sharing-frontend   Up
```

### Step 3: Check Backend Health

```bash
curl http://localhost:3001/api
```

**Expected:** Should return a 404 JSON response (means backend is running)

### Step 4: Check Frontend

Open your browser: http://localhost:3000

**Expected:** You should see the landing page with:
- "Welcome to ParcelShare" heading
- "Get Started" and "Browse Trips" buttons
- Three feature cards (Send Parcels, Offer Trips, Build Community)

---

## Complete Feature Test (15 minutes)

### Test 1: User Registration ✅

1. **Navigate to Sign Up**
   - Click "Sign Up" in the navbar
   - URL should be: http://localhost:3000/auth/signup

2. **Create Account**
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `+31612345678` (optional)
   - Password: `password123`
   - Click "Sign Up"

3. **Verify Success**
   - Should redirect to `/dashboard`
   - Should see "Hello, Test User" in navbar
   - Should see two empty sections: "My Parcels" and "My Trips"

**✅ PASS if:** You're logged in and see the dashboard

### Test 2: Create a Parcel Request ✅

1. **Navigate**
   - From dashboard, click "Send a Parcel"
   - Or go directly to: http://localhost:3000/parcels/create

2. **Fill Form**
   ```
   From Location: Amsterdam, Netherlands
   To Location: Brussels, Belgium
   From Lat: 52.3676
   From Lng: 4.9041
   To Lat: 50.8503
   To Lng: 4.3517
   Size: Small
   Description: Important documents
   Reward: 15
   Pickup Date: Tomorrow at 10:00
   Delivery Date: Tomorrow at 18:00
   ```

3. **Submit**
   - Click "Create Parcel Request"
   - Should redirect to dashboard

4. **Verify**
   - Should see your parcel in "My Parcels" section
   - Status should be "REQUESTED"
   - Shows route and dates correctly

**✅ PASS if:** Parcel appears in your dashboard

### Test 3: Create a Trip Offer ✅

1. **Sign Out and Create Second User**
   - Click "Sign Out"
   - Sign up as: `traveler@example.com` / `password123` / `Jane Traveler`

2. **Create Trip**
   - Click "Offer a Trip" from dashboard
   - Or go to: http://localhost:3000/trips/create

3. **Fill Form**
   ```
   From Location: Amsterdam, Netherlands
   To Location: Brussels, Belgium
   From Lat: 52.3676
   From Lng: 4.9041
   To Lat: 50.8503
   To Lng: 4.3517
   Transport Type: Car
   Departure: Tomorrow at 09:00
   Arrival: Tomorrow at 12:00
   Capacity: 2
   Notes: Comfortable ride, can stop for coffee
   ```

4. **Submit and Verify**
   - Should see trip in "My Trips"
   - Status should be "PLANNED"

**✅ PASS if:** Trip appears in your dashboard

### Test 4: Intelligent Matching ✅

1. **View Parcel Details**
   - Sign in as first user: `test@example.com`
   - Go to dashboard
   - Click on your parcel
   - URL: http://localhost:3000/parcels/[id]

2. **Check Matching Trips**
   - Scroll down to "Matching Trips" section
   - Should see Jane's trip listed
   - Should show Match Score (around 100%)
   - Should show route matches

3. **View Trip Matches (Other Side)**
   - Sign out and sign in as `traveler@example.com`
   - Go to your trip details
   - Should see "Matching Parcels" section
   - Should see the parcel you created earlier

**✅ PASS if:** Both sides show matching with scores

### Test 5: Accept Delivery ✅

1. **As Traveler, Accept Parcel**
   - While viewing your trip (as Jane)
   - In "Matching Parcels" section
   - Click "Accept Parcel" on the matched parcel

2. **Verify Status Change**
   - Should see success
   - Parcel should now be in "Accepted Parcels" section
   - Trip capacity should be reduced

3. **Check Sender's View**
   - Sign out and sign in as `test@example.com`
   - Go to dashboard
   - Your parcel status should now be "ACCEPTED"
   - Should show carrier information (Jane Traveler)

**✅ PASS if:** Parcel status changed to accepted on both sides

### Test 6: Notifications ✅

1. **Check Notifications**
   - As the parcel sender (`test@example.com`)
   - Click "Notifications" in navbar
   - Should see notification: "Your parcel... has been accepted!"

2. **As Traveler**
   - Sign in as `traveler@example.com`
   - Check notifications
   - Should see: "You accepted a parcel..."

3. **Mark as Read**
   - Click on a notification
   - Should change from bold to normal
   - Blue dot should disappear

**✅ PASS if:** Both users received notifications

### Test 7: Search & Browse ✅

1. **Browse Available Parcels**
   - Click "Search" in navbar
   - Tab: "Available Parcels"
   - Should show all requested parcels (not accepted)

2. **Browse Available Trips**
   - Switch to "Available Trips" tab
   - Should show all planned trips

3. **Create More and Verify**
   - Create another parcel or trip
   - Should appear in search results immediately

**✅ PASS if:** All items are browsable

---

## API Testing (Using curl)

### Test Authentication

```bash
# Sign Up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "password123",
    "name": "API Test User"
  }' | jq

# Save the token from response
TOKEN="your-token-here"

# Sign In
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "password123"
  }' | jq
```

**✅ PASS if:** Both return user object and JWT token

### Test Parcel Creation

```bash
TOKEN="your-token-here"

curl -X POST http://localhost:3001/api/parcels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fromLocation": "Paris, France",
    "toLocation": "Berlin, Germany",
    "fromLat": 48.8566,
    "fromLng": 2.3522,
    "toLat": 52.5200,
    "toLng": 13.4050,
    "size": "medium",
    "description": "Books",
    "rewardAmount": 20,
    "desiredPickupDate": "2024-12-25T10:00:00Z",
    "desiredDeliveryDate": "2024-12-25T18:00:00Z"
  }' | jq
```

**✅ PASS if:** Returns created parcel with ID

### Test Get Parcels

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/parcels | jq
```

**✅ PASS if:** Returns array of parcels

### Test Matching

```bash
# Get parcel ID from previous response
PARCEL_ID="your-parcel-id"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/matching/parcel/$PARCEL_ID | jq
```

**✅ PASS if:** Returns matching trips with scores

---

## Database Verification

### Connect to Database

```bash
docker exec -it parcel-sharing-db psql -U postgres parcel_sharing
```

### Check Data

```sql
-- View all users
SELECT id, email, name FROM users;

-- View all parcels
SELECT id, "fromLocation", "toLocation", status FROM parcels;

-- View all trips
SELECT id, "fromLocation", "toLocation", status FROM trips;

-- View all notifications
SELECT id, type, message, "isRead" FROM notifications;

-- Check matching (parcels with trips)
SELECT 
  p."fromLocation" as parcel_from,
  p."toLocation" as parcel_to,
  p.status,
  t."fromLocation" as trip_from,
  t."toLocation" as trip_to
FROM parcels p
LEFT JOIN trips t ON p."tripId" = t.id;

-- Exit
\q
```

**✅ PASS if:** Data matches what you created in UI

---

## Automated Tests

### Backend Unit Tests

```bash
cd backend
npm test
```

**Expected:**
```
PASS  src/auth/auth.service.spec.ts
PASS  src/parcels/parcels.service.spec.ts
Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
```

**✅ PASS if:** All tests pass

### Frontend E2E Tests

```bash
cd frontend

# Install browsers (first time only)
npx playwright install chromium

# Run tests
npm run test:e2e
```

**Expected:**
```
Running 3 tests using 1 worker
✓ auth.spec.ts:3:3 › should display sign in page (500ms)
✓ auth.spec.ts:9:3 › should display sign up page (400ms)
✓ auth.spec.ts:16:3 › should redirect to sign in when not authenticated (300ms)

3 passed (2.1s)
```

**✅ PASS if:** All E2E tests pass

---

## Performance Check

### Response Time Test

```bash
# Test backend response time
time curl -s http://localhost:3001/api/parcels > /dev/null

# Should be < 1 second
```

### Load Test (Optional)

```bash
# Install apache bench
# brew install apache-bench  (macOS)
# apt-get install apache2-utils  (Linux)

# Test 100 requests with 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/parcels
```

**✅ PASS if:** Average response time < 500ms

---

## Common Issues & Solutions

### ❌ Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### ❌ Database connection failed
```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### ❌ Frontend can't connect to backend
```bash
# Verify CORS settings
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:3001/api/auth/signup -v
```

### ❌ JWT token invalid
```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()

# Sign out and sign in again
```

---

## Success Criteria ✅

Your MVP is working if ALL of these pass:

- ✅ Services start without errors
- ✅ Users can sign up and sign in
- ✅ Parcels can be created and listed
- ✅ Trips can be created and listed
- ✅ Matching algorithm finds compatible trips/parcels
- ✅ Travelers can accept parcels
- ✅ Notifications are sent on acceptance
- ✅ Search shows available items
- ✅ Database persists data
- ✅ API responds to curl requests
- ✅ All automated tests pass

If ALL of these work, your ParcelShare MVP is **production-ready**! 🎉

---

## Next Steps After Verification

1. **Deploy to staging environment**
2. **Test with real users (friends/family)**
3. **Gather feedback**
4. **Add features from roadmap**
5. **Launch! 🚀**

