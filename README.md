# 📦 parcely - Peer-to-Peer Parcel Delivery Platform MVP

A modern web platform connecting people who want to send small parcels with travelers already heading that way. Built with NestJS, Next.js, PostgreSQL, and TypeScript.

## 🌟 Features

### Core Functionality
- **User Authentication**: JWT-based signup/login system
- **Parcel Management**: Create, list, and track parcel delivery requests
- **Trip Offers**: Travelers can offer trips and earn by carrying parcels
- **Smart Matching**: Intelligent algorithm matches parcels with compatible trips based on:
  - Route proximity (within 50km)
  - Time compatibility
  - Capacity availability
- **Real-time Notifications**: Event-driven notification system for status updates
- **Status Tracking**: Track parcels from requested → accepted → in transit → delivered

### User Roles
- **Senders**: Post parcel delivery requests with optional rewards
- **Travelers**: Offer trips and accept parcels to carry
- **Both**: Users can be both senders and travelers

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Architecture**: Modular monolith with event-driven patterns
- **Modules**:
  - Auth: User authentication and authorization
  - Users: Profile management
  - Parcels: Parcel CRUD and status management
  - Trips: Trip CRUD and capacity management
  - Matching: Intelligent parcel-trip matching algorithm
  - Notifications: Event-based notification system

### Frontend (Next.js)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API for auth
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form with validation

### Database Schema
```
Users
├── id (UUID)
├── email (unique)
├── password (hashed)
├── name
├── phone
└── photoUrl

Parcels
├── id (UUID)
├── fromLocation / toLocation
├── fromLat, fromLng / toLat, toLng
├── size (small/medium/large)
├── description
├── rewardAmount
├── desiredPickupDate / desiredDeliveryDate
├── status (requested/accepted/in_transit/delivered/cancelled)
├── senderId → User
├── carrierId → User
└── tripId → Trip

Trips
├── id (UUID)
├── fromLocation / toLocation
├── fromLat, fromLng / toLat, toLng
├── transportType (car/bus/train)
├── departureTime / arrivalTime
├── availableCapacity
├── notes
├── status (planned/in_progress/completed/cancelled)
└── travelerId → User

Notifications
├── id (UUID)
├── userId → User
├── type
├── message
├── metadata (JSON)
└── isRead
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- PostgreSQL 15+
- Docker & Docker Compose (optional, for containerized setup)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
```bash
cd "/Users/markodjordjevic/reMa/parcel-sharing-platform mvp"
```

2. **Start all services with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on http://localhost:3001
- Frontend app on http://localhost:3000

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

### Option 2: Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=parcel_sharing

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
```

4. **Start PostgreSQL**
```bash
# Using Docker
docker run --name parcel-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=parcel_sharing -p 5432:5432 -d postgres:15-alpine

# Or use your local PostgreSQL installation
```

5. **Run the backend**
```bash
npm run start:dev
```

Backend will be available at http://localhost:3001/api

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. **Run the frontend**
```bash
npm run dev
```

Frontend will be available at http://localhost:3000

## 🧪 Testing

### Backend Tests (Jest)

```bash
cd backend

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Frontend Tests (Playwright)

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run tests in specific browser
npx playwright test --project=chromium
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+31612345678"
}
```

#### POST `/api/auth/signin`
Sign in existing user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Parcel Endpoints

#### POST `/api/parcels`
Create a new parcel request (requires auth)
```json
{
  "fromLocation": "Amsterdam, Netherlands",
  "toLocation": "Brussels, Belgium",
  "fromLat": 52.3676,
  "fromLng": 4.9041,
  "toLat": 50.8503,
  "toLng": 4.3517,
  "size": "small",
  "description": "Documents",
  "rewardAmount": 10.00,
  "desiredPickupDate": "2024-12-20T10:00:00Z",
  "desiredDeliveryDate": "2024-12-20T18:00:00Z"
}
```

#### GET `/api/parcels`
List all parcels (supports filtering)
- Query params: `status`, `size`, `fromDate`, `toDate`

#### GET `/api/parcels/my-parcels`
Get current user's parcels

#### GET `/api/parcels/:id`
Get parcel details

#### POST `/api/parcels/:id/accept`
Accept a parcel for delivery
```json
{
  "tripId": "trip-uuid"
}
```

### Trip Endpoints

#### POST `/api/trips`
Create a new trip offer (requires auth)
```json
{
  "fromLocation": "Amsterdam, Netherlands",
  "toLocation": "Brussels, Belgium",
  "fromLat": 52.3676,
  "fromLng": 4.9041,
  "toLat": 50.8503,
  "toLng": 4.3517,
  "transportType": "car",
  "departureTime": "2024-12-20T10:00:00Z",
  "arrivalTime": "2024-12-20T13:00:00Z",
  "availableCapacity": 2,
  "notes": "Driving via highway"
}
```

#### GET `/api/trips`
List all trips (supports filtering)
- Query params: `status`, `transportType`, `fromDate`, `toDate`

#### GET `/api/trips/my-trips`
Get current user's trips

#### GET `/api/trips/:id`
Get trip details

### Matching Endpoints

#### GET `/api/matching/parcel/:parcelId`
Find matching trips for a parcel

#### GET `/api/matching/trip/:tripId`
Find matching parcels for a trip

### Notification Endpoints

#### GET `/api/notifications`
Get user notifications
- Query params: `unreadOnly=true`

#### PUT `/api/notifications/:id/read`
Mark notification as read

#### PUT `/api/notifications/read-all`
Mark all notifications as read

## 🎨 Frontend Pages

- `/` - Landing page
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/dashboard` - User dashboard
- `/parcels/create` - Create parcel request
- `/parcels/:id` - Parcel details with matching trips
- `/trips/create` - Create trip offer
- `/trips/:id` - Trip details with matching parcels
- `/search` - Browse available parcels and trips
- `/notifications` - User notifications

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected routes with guards
- Input validation with class-validator
- CORS enabled for frontend

## 🌍 Deployment

### Backend Deployment (Render/Railway)

1. Connect your repository
2. Set environment variables
3. Deploy as Docker container or Node.js app
4. Ensure PostgreSQL database is configured

### Frontend Deployment (Vercel)

1. Import project from GitHub
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically on push

### Environment Variables for Production

**Backend:**
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET` (use a strong secret!)
- `NODE_ENV=production`

**Frontend:**
- `NEXT_PUBLIC_API_URL` (your backend API URL)

## 📦 Tech Stack

### Backend
- NestJS 10+
- TypeORM
- PostgreSQL 15
- Passport JWT
- bcrypt
- class-validator

### Frontend
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Axios
- date-fns

### DevOps
- Docker & Docker Compose
- Jest (backend testing)
- Playwright (E2E testing)

## 🗺️ Roadmap

### Phase 1 (Current MVP)
- ✅ User authentication
- ✅ Parcel and trip management
- ✅ Basic matching algorithm
- ✅ Event-based notifications

### Phase 2 (Future)
- [ ] Real-time chat between users
- [ ] Payment integration (Stripe)
- [ ] Rating and review system
- [ ] Advanced search filters
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Email notifications
- [ ] Photo uploads for parcels
- [ ] ID verification
- [ ] Insurance options

### Phase 3 (Scale)
- [ ] Multi-region support
- [ ] Microservices architecture
- [ ] Message queue (RabbitMQ/Redis)
- [ ] Caching layer
- [ ] CDN integration
- [ ] Advanced analytics

## 🤝 Contributing

This is an MVP project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👥 Support

For questions or issues:
- Create an issue on GitHub
- Contact: [your-email@example.com]

## 🙏 Acknowledgments

Built with modern web technologies and best practices for MVP development.

---

**Happy parceling! 📦🚗🤝**


