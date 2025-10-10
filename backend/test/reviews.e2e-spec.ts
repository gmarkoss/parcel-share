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
import { Review } from '../src/entities/review.entity';
import * as bcrypt from 'bcrypt';

describe('Reviews (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let parcelRepository: Repository<Parcel>;
  let tripRepository: Repository<Trip>;
  let matchRepository: Repository<Match>;
  let reviewRepository: Repository<Review>;

  let sender: User;
  let traveler: User;
  let senderToken: string;
  let travelerToken: string;
  let match: Match;
  let review: Review;

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
    reviewRepository = moduleFixture.get<Repository<Review>>(
      getRepositoryToken(Review),
    );

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    sender = await userRepository.save({
      email: 'sender-review@test.com',
      firstName: 'Sender',
      lastName: 'User',
      phoneNumber: '1111111111',
      passwordHash: hashedPassword,
    });

    traveler = await userRepository.save({
      email: 'traveler-review@test.com',
      firstName: 'Traveler',
      lastName: 'User',
      phoneNumber: '2222222222',
      passwordHash: hashedPassword,
    });

    // Login to get tokens
    const senderLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'sender-review@test.com', password: 'password123' });
    senderToken = senderLogin.body.accessToken;

    const travelerLogin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: 'traveler-review@test.com', password: 'password123' });
    travelerToken = travelerLogin.body.accessToken;

    // Create test data
    const parcel = await parcelRepository.save({
      fromLocation: 'New York',
      toLocation: 'Los Angeles',
      fromLat: 40.7128,
      fromLng: -74.006,
      toLat: 34.0522,
      toLng: -118.2437,
      size: 'medium',
      description: 'Test parcel for review',
      rewardAmount: 50,
      desiredPickupDate: new Date('2025-01-15'),
      desiredDeliveryDate: new Date('2025-01-20'),
      status: 'delivered',
      sender: sender,
      senderId: sender.id,
    });

    const trip = await tripRepository.save({
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
      status: 'completed',
      traveler: traveler,
      travelerId: traveler.id,
    });

    // Create completed match
    match = await matchRepository.save({
      parcel: parcel,
      parcelId: parcel.id,
      trip: trip,
      tripId: trip.id,
      sender: sender,
      senderId: sender.id,
      traveler: traveler,
      travelerId: traveler.id,
      status: MatchStatus.COMPLETED,
      matchScore: 90,
    });
  });

  afterAll(async () => {
    // Cleanup
    await reviewRepository.delete({});
    await matchRepository.delete({});
    await parcelRepository.delete({});
    await tripRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/reviews (POST)', () => {
    it('should create a review for completed match', () => {
      return request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          matchId: match.id,
          revieweeId: traveler.id,
          rating: 5,
          comment: 'Excellent service!',
          isAnonymous: false,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.rating).toBe(5);
          expect(response.body.comment).toBe('Excellent service!');
          review = response.body;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/reviews')
        .send({
          matchId: match.id,
          revieweeId: traveler.id,
          rating: 5,
        })
        .expect(401);
    });

    it('should fail with invalid rating', () => {
      return request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          matchId: match.id,
          revieweeId: sender.id,
          rating: 6, // Invalid: should be 1-5
          comment: 'Test',
        })
        .expect(400);
    });

    it('should fail if already reviewed', () => {
      return request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          matchId: match.id,
          revieweeId: traveler.id,
          rating: 4,
          comment: 'Another review',
        })
        .expect(400);
    });
  });

  describe('/reviews (GET)', () => {
    it('should get all reviews', () => {
      return request(app.getHttpServer())
        .get('/reviews')
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/reviews/:id (GET)', () => {
    it('should get a specific review', () => {
      return request(app.getHttpServer())
        .get(`/reviews/${review.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(review.id);
          expect(response.body.rating).toBe(5);
        });
    });
  });

  describe('/reviews/user/:userId (GET)', () => {
    it('should get all reviews for a user', () => {
      return request(app.getHttpServer())
        .get(`/reviews/user/${traveler.id}`)
        .set('Authorization', `Bearer ${travelerToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/reviews/user/:userId/average (GET)', () => {
    it('should get average rating for a user', () => {
      return request(app.getHttpServer())
        .get(`/reviews/user/${traveler.id}/average`)
        .set('Authorization', `Bearer ${travelerToken}`)
        .expect(200)
        .then((response) => {
          expect(typeof response.body).toBe('number');
          expect(response.body).toBeGreaterThan(0);
        });
    });
  });

  describe('/reviews/match/:matchId (GET)', () => {
    it('should get reviews for a match', () => {
      return request(app.getHttpServer())
        .get(`/reviews/match/${match.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('/reviews/:id (PATCH)', () => {
    it('should update own review', () => {
      return request(app.getHttpServer())
        .patch(`/reviews/${review.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          rating: 4,
          comment: 'Updated comment',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.rating).toBe(4);
          expect(response.body.comment).toBe('Updated comment');
        });
    });

    it('should fail if non-reviewer tries to update', () => {
      return request(app.getHttpServer())
        .patch(`/reviews/${review.id}`)
        .set('Authorization', `Bearer ${travelerToken}`)
        .send({
          rating: 3,
        })
        .expect(403);
    });
  });

  describe('/reviews/:id (DELETE)', () => {
    it('should fail if non-reviewer tries to delete', () => {
      return request(app.getHttpServer())
        .delete(`/reviews/${review.id}`)
        .set('Authorization', `Bearer ${travelerToken}`)
        .expect(403);
    });

    it('should allow reviewer to delete own review', () => {
      return request(app.getHttpServer())
        .delete(`/reviews/${review.id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);
    });
  });
});

