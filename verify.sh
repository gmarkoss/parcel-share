#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 ParcelShare MVP - Verification Script"
echo "========================================"
echo ""

# Test 1: Check if backend is running
echo "1️⃣  Testing Backend API..."
if curl -s http://localhost:3001/api > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    echo "   Try: cd backend && npm run start:dev"
fi

# Test 2: Check if frontend is running
echo ""
echo "2️⃣  Testing Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    echo "   Try: cd frontend && npm run dev"
fi

# Test 3: Check database connection
echo ""
echo "3️⃣  Testing Database Connection..."
if curl -s http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}' \
  > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is connected${NC}"
else
    echo -e "${YELLOW}⚠ Database might not be connected or user exists${NC}"
fi

# Test 4: Create a test user and get token
echo ""
echo "4️⃣  Testing User Registration..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"verify_$(date +%s)@test.com\",\"password\":\"password123\",\"name\":\"Test User\"}")

if echo "$SIGNUP_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ User registration works${NC}"
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token received: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ User registration failed${NC}"
    echo "   Response: $SIGNUP_RESPONSE"
    TOKEN=""
fi

# Test 5: Create a parcel
if [ -n "$TOKEN" ]; then
    echo ""
    echo "5️⃣  Testing Parcel Creation..."
    PARCEL_RESPONSE=$(curl -s -X POST http://localhost:3001/api/parcels \
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
        "description": "Test parcel",
        "desiredPickupDate": "2024-12-25T10:00:00Z",
        "desiredDeliveryDate": "2024-12-25T18:00:00Z"
      }')
    
    if echo "$PARCEL_RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✓ Parcel creation works${NC}"
        PARCEL_ID=$(echo "$PARCEL_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo "   Parcel ID: $PARCEL_ID"
    else
        echo -e "${RED}✗ Parcel creation failed${NC}"
        echo "   Response: $PARCEL_RESPONSE"
    fi
    
    # Test 6: Get parcels
    echo ""
    echo "6️⃣  Testing Parcel Listing..."
    PARCELS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/parcels)
    if echo "$PARCELS" | grep -q "fromLocation"; then
        echo -e "${GREEN}✓ Parcel listing works${NC}"
        COUNT=$(echo "$PARCELS" | grep -o '"id"' | wc -l)
        echo "   Found $COUNT parcel(s)"
    else
        echo -e "${RED}✗ Parcel listing failed${NC}"
    fi
fi

echo ""
echo "========================================"
echo "🎉 Verification Complete!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Sign up for an account"
echo "3. Create a parcel or trip"
echo "4. Test the matching feature"
echo ""


