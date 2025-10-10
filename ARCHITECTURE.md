# ParcelShare - Architecture Documentation

## System Overview

ParcelShare is a peer-to-peer parcel delivery platform built as a monolithic application with event-driven patterns, designed to scale into microservices if needed.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Parcels  │  │  Trips   │  │Matching  │   │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                         │                                    │
│                    Axios Client                              │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP/REST
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                    NestJS Backend                            │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────┐            │
│  │           Controllers Layer                 │            │
│  │  Auth │ Users │ Parcels │ Trips │ Matching │            │
│  └──────────────────┬──────────────────────────┘            │
│                     │                                        │
│  ┌──────────────────┴──────────────────────────┐            │
│  │           Services Layer                    │            │
│  │  Auth │ Users │ Parcels │ Trips │ Matching │            │
│  └──────────────────┬──────────────────────────┘            │
│                     │                                        │
│  ┌──────────────────┴──────────────────────────┐            │
│  │         Event Emitter (Internal)            │            │
│  │  parcel.created │ parcel.accepted │ etc.   │            │
│  └──────────────────┬──────────────────────────┘            │
│                     │                                        │
│  ┌──────────────────┴──────────────────────────┐            │
│  │         Notification Listeners              │            │
│  └──────────────────┬──────────────────────────┘            │
│                     │                                        │
│  ┌──────────────────┴──────────────────────────┐            │
│  │             TypeORM Repository              │            │
│  └──────────────────┬──────────────────────────┘            │
└─────────────────────┼────────────────────────────────────────┘
                      │
┌─────────────────────┴────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Parcels  │  │  Trips   │  │ Notifs   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layered Architecture

1. **Controllers Layer**
   - Handle HTTP requests
   - Validate input (DTOs with class-validator)
   - Route to appropriate service
   - Apply guards (JWT authentication)

2. **Services Layer**
   - Business logic
   - Database operations via repositories
   - Emit events for cross-module communication
   - Error handling

3. **Repository Layer**
   - TypeORM repositories
   - Database queries
   - Entity management

4. **Event Layer**
   - EventEmitter2 for internal events
   - Listeners for notifications
   - Decoupled module communication

### Modules

#### Auth Module
- **Purpose**: User authentication and JWT management
- **Components**:
  - `AuthController`: signup, signin endpoints
  - `AuthService`: password hashing, JWT generation
  - `JwtStrategy`: Passport JWT strategy
  - `JwtAuthGuard`: Global authentication guard
- **Entities**: User

#### Users Module
- **Purpose**: User profile management
- **Components**:
  - `UsersController`: profile CRUD
  - `UsersService`: user operations
- **Entities**: User

#### Parcels Module
- **Purpose**: Parcel request management
- **Components**:
  - `ParcelsController`: parcel CRUD, accept, status updates
  - `ParcelsService`: parcel business logic
- **Entities**: Parcel
- **Events Emitted**:
  - `parcel.created`
  - `parcel.accepted`
  - `parcel.status.changed`

#### Trips Module
- **Purpose**: Trip offer management
- **Components**:
  - `TripsController`: trip CRUD, status updates
  - `TripsService`: trip business logic, capacity management
- **Entities**: Trip
- **Events Emitted**:
  - `trip.created`
  - `trip.status.changed`

#### Matching Module
- **Purpose**: Intelligent parcel-trip matching
- **Components**:
  - `MatchingController`: matching endpoints
  - `MatchingService`: matching algorithm
- **Algorithm**:
  - Distance matching: Haversine formula (50km radius)
  - Time matching: pickup/delivery within trip timeframe
  - Capacity checking: available space validation
  - Scoring: 0-100 based on distance + time match

#### Notifications Module
- **Purpose**: Event-based notification system
- **Components**:
  - `NotificationsController`: notification CRUD
  - `NotificationsService`: notification creation and management
  - `NotificationsListener`: Event listeners for automatic notifications
- **Entities**: Notification
- **Events Listened**:
  - `parcel.accepted` → notify sender and carrier
  - `parcel.status.changed` → notify relevant parties
  - `trip.status.changed` → notify traveler

## Frontend Architecture

### Structure

```
app/
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx                # Landing page
├── auth/
│   ├── signin/page.tsx     # Sign in
│   └── signup/page.tsx     # Sign up
├── dashboard/page.tsx      # User dashboard
├── parcels/
│   ├── create/page.tsx     # Create parcel
│   └── [id]/page.tsx       # Parcel details + matches
├── trips/
│   ├── create/page.tsx     # Create trip
│   └── [id]/page.tsx       # Trip details + matches
├── search/page.tsx         # Browse parcels/trips
└── notifications/page.tsx  # User notifications

components/
└── Navbar.tsx              # Navigation bar

contexts/
└── AuthContext.tsx         # Authentication state

lib/
├── api.ts                  # Axios client with interceptors
└── types.ts                # TypeScript interfaces
```

### State Management

- **Authentication**: React Context API
  - User state
  - Token management
  - Auth methods (signIn, signUp, signOut)
  - Auto-redirect for protected routes

- **Local State**: React useState/useEffect
  - Form data
  - Loading states
  - Error handling

### API Communication

- **Axios Client**:
  - Base URL configuration
  - Automatic JWT token injection
  - 401 handling (auto-logout)
  - Error interceptors

## Database Schema

### Entity Relationships

```
User 1──────* Parcel (as sender)
User 1──────* Parcel (as carrier)
User 1──────* Trip (as traveler)
Trip 1──────* Parcel

User 1──────* Notification
```

### Key Design Decisions

1. **Separate sender and carrier**: Allows same user to be both
2. **Lat/Lng storage**: Enables proximity-based matching
3. **Status enums**: Clear state machine for parcels and trips
4. **Metadata JSON**: Flexible notification data storage
5. **Eager loading**: Optimize common queries with relations

## Event-Driven Architecture

### Events Flow

```
User Action → Service → Event Emission → Listener → Notification Creation
```

Example: Parcel Acceptance
```
1. POST /parcels/:id/accept
2. ParcelsService.acceptParcel()
3. Emit 'parcel.accepted' event
4. NotificationsListener.handleParcelAccepted()
5. Create notifications for sender and carrier
```

### Benefits

- **Decoupling**: Modules don't depend on each other directly
- **Scalability**: Easy to add new listeners
- **Testability**: Mock event emitter in tests
- **Future-proof**: Can migrate to external queue (RabbitMQ, Redis)

## Security Considerations

### Backend

1. **Password Security**
   - bcrypt hashing (10 rounds)
   - Never return password in responses

2. **JWT Authentication**
   - Signed tokens
   - Configurable expiration
   - Bearer token in Authorization header

3. **Input Validation**
   - class-validator decorators
   - DTO validation
   - Type safety with TypeScript

4. **Authorization**
   - Resource ownership checks
   - User-specific queries (userId filters)

### Frontend

1. **Token Storage**
   - localStorage (client-side only)
   - Automatic cleanup on logout

2. **Route Protection**
   - Check auth state before render
   - Redirect to signin if not authenticated

3. **Error Handling**
   - User-friendly error messages
   - No sensitive data in errors

## Scalability Path

### Current (MVP)

- Monolithic NestJS app
- Single PostgreSQL instance
- Internal EventEmitter

### Phase 2 (Growth)

- Redis for caching
- Redis pub/sub for events
- Separate notification service
- Load balancer

### Phase 3 (Scale)

- Microservices:
  - Auth Service
  - Parcel Service
  - Trip Service
  - Matching Service
  - Notification Service
- RabbitMQ/Kafka for events
- PostgreSQL read replicas
- API Gateway
- CDN for static assets

## Testing Strategy

### Backend (Jest)

- **Unit Tests**: Service methods, utilities
- **Integration Tests**: Controllers with mocked services
- **E2E Tests**: Full API flow with test database

### Frontend (Playwright)

- **E2E Tests**: User journeys
  - Authentication flow
  - Create parcel flow
  - Create trip flow
  - Accept delivery flow
- **Visual Tests**: Component rendering
- **API Mocking**: Isolated frontend testing

## Performance Considerations

### Current Optimizations

1. **Database**
   - Indexes on foreign keys
   - Eager loading for common relations
   - Query builder for complex filters

2. **API**
   - Pagination ready (implement when needed)
   - Selective field loading
   - Query parameter filtering

3. **Frontend**
   - Next.js SSR/SSG capabilities
   - Code splitting (automatic)
   - Image optimization (Next.js)

### Future Optimizations

1. **Caching**
   - Redis for frequent queries
   - Client-side caching (React Query)

2. **Database**
   - Connection pooling
   - Read replicas
   - Database sharding by region

3. **API**
   - GraphQL for flexible queries
   - WebSocket for real-time updates
   - Rate limiting

## Deployment Architecture

### Development

```
Docker Compose:
- postgres:5432
- backend:3001
- frontend:3000
```

### Production

```
Frontend (Vercel):
- Next.js app
- Edge functions
- CDN for static assets

Backend (Render/Railway):
- NestJS app
- Docker container
- Auto-scaling

Database (Managed PostgreSQL):
- Automated backups
- Connection pooling
- Monitoring
```

## Monitoring & Logging

### Current (MVP)

- Console logging
- NestJS built-in logger
- Development mode verbose logging

### Future

- Structured logging (Winston)
- Error tracking (Sentry)
- APM (New Relic, Datadog)
- Metrics dashboard
- Alerting system

---

This architecture is designed to be simple for MVP while allowing for future growth and scalability.

