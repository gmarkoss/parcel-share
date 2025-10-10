import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Parcel } from '../src/entities/parcel.entity';
import { Trip } from '../src/entities/trip.entity';
import { Match, MatchStatus } from '../src/entities/match.entity';
import * as bcrypt from 'bcrypt';

describe('Matches (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let parcelRepository: Repository<Parcel>;
  let tripRepository: Repository<Trip>;
  let matchRepository: Repository<Match>;

  let sender: User;
  let traveler: User;
  let senderToken: string;
  let travelerToken: string;
  let parcel: Parcel;
  let trip: Trip;
  let match: Match;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    parcelRepository = moduleFixture.get<Repository<Parcel>>(
      getRepositoryToken(Parcel),
    );
    tripRepository = moduleFixture.get<Repository<Trip>>(
      getRepositoryToken(Trip),
    );
    matchRepository = moduleFixture.get<Repository<Match>>(
      getRepositoryToken(Match),
    );

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    sender = await userRepository.save({
      email: 'sender@test.com',
      firstName: 'Sender',
      lastName: 'User',
      phoneNumber: '1234567890',
      passwordHash: hashedPassword,
    });

    traveler = await userRepository.save({
      email: 'traveler@test.com',
      firstName: 'Traveler',
      lastName: 'User',
      phoneNumber: '0987654321',
      passwordHash: hashedPassword,
    });

    // Login to get tokens
    const senderLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'sender@test.com', password: 'password123' });
    senderToken = senderLogin.body.accessToken;

    const travelerLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'traveler@test.com', password: 'password123' });
    travelerToken = travelerLogin.body.accessToken;

    // Create test parcel
    parcel = await parcelRepository.save({
      fromLocation: 'New York',
      toLocation: 'Los Angeles',
      fromLat: 40.7128,
      fromLng: -74.006,
      toLat: 34.0522,
      toLng: -118.2437,
      size: 'medium',
      description: 'Test parcel',
      rewardAmount: 50,
      desiredPickupDate: new Date('2025-01-15'),
      desiredDeliveryDate: new Date('2025-01-20'),
      status: 'requested',
      sender: sender,
      senderId: sender.id,
    });

    // Create test trip
    trip = await tripRepository.save({
      fromLocation: 'New York',
      toLocation: 'Los Angeles',
      fromLat: 40.7128,
      fromLng: -74.006,
      toLat: 34.0522,
      toLng: -118.2437,
      transportType: 'car',
      departureTime: new Date('2025-01-15'),
      arrivalTime: new Date('2025-01-16'),
      availableCapacity: 20,
      status: 'planned',
      traveler: traveler,
      travelerId: traveler.id,
    });
  });

  afterAll(async () => {
    // Cleanup
    await matchRepository.delete({});
    await parcelRepository.delete({});
    await tripRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/matches (POST)', () => {
    it('should create a match', () => {
      return request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          parcelId: parcel.id,
          tripId: trip.id,
          matchScore: 85,
          notes: 'Test match',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.status).toBe(MatchStatus.PENDING);
          expect(response.body.matchScore).toBe(85);
          match = response.body;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/matches')
        .send({
          parcelId: parcel.id,
          tripId: trip.id,
        })
        .expect(401);
    });

    it('should fail with invalid parcelId', () => {
      return request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          parcelId: 'invalid-uuid',
          tripId: trip.id,
        })
        .expect(400);
    });
  });

  describe('/matches (GET)', () => {
    it('should get all matches for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/matches')
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/matches').expect(401);
    });
  });

  describe('/matches/:id (GET)', () => {
    it('should get a specific match', () => {
      return request(app.getHttpServer())
        .get(`/matches/${match.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(match.id);
        });
    });

    it('should fail for non-participant', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const otherUser = await userRepository.save({
        email: 'other@test.com',
        firstName: 'Other',
        lastName: 'User',
        phoneNumber: '5555555555',
        passwordHash: hashedPassword,
      });

      const otherLogin = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'other@test.com', password: 'password123' });

      return request(app.getHttpServer())
        .get(`/matches/${match.id}`)
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
        .expect(403);
    });
  });

  describe('/matches/:id/status (PATCH)', () => {
    it('should allow traveler to accept match', () => {
      return request(app.getHttpServer())
        .patch(`/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          status: MatchStatus.ACCEPTED,
          notes: 'Accepted!',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.status).toBe(MatchStatus.ACCEPTED);
        });
    });

    it('should fail if sender tries to accept', () => {
      return request(app.getHttpServer())
        .patch(`/matches/${match.id}/status`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          status: MatchStatus.ACCEPTED,
        })
        .expect(403);
    });
  });

  describe('/matches/parcel/:parcelId (GET)', () => {
    it('should get matches for a parcel', () => {
      return request(app.getHttpServer())
        .get(`/matches/parcel/${parcel.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('/matches/trip/:tripId (GET)', () => {
    it('should get matches for a trip', () => {
      return request(app.getHttpServer())
        .get(`/matches/trip/${trip.id}`)
        .set('Authorization', `Bearer ${travelerToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('/matches/:id (DELETE)', () => {
    it('should fail if non-sender tries to delete', () => {
      return request(app.getHttpServer())
        .delete(`/matches/${match.id}`)
        .set('Authorization', `Bearer ${travelerToken}`)
        .expect(403);
    });

    it('should allow sender to delete match', () => {
      return request(app.getHttpServer())
        .delete(`/matches/${match.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);
    });
  });
});

