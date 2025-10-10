import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review, ReviewType } from '../entities/review.entity';
import { Match, MatchStatus } from '../entities/match.entity';
import { User } from '../entities/user.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;
  let matchRepository: Repository<Match>;
  let userRepository: Repository<User>;

  const mockSender: User = {
    id: 'sender-1',
    email: 'sender@example.com',
    firstName: 'Sender',
    lastName: 'User',
  } as User;

  const mockTraveler: User = {
    id: 'traveler-1',
    email: 'traveler@example.com',
    firstName: 'Traveler',
    lastName: 'User',
  } as User;

  const mockMatch: Match = {
    id: 'match-1',
    senderId: 'sender-1',
    travelerId: 'traveler-1',
    status: MatchStatus.COMPLETED,
  } as Match;

  const mockReview: Review = {
    id: 'review-1',
    match: mockMatch,
    matchId: 'match-1',
    reviewer: mockSender,
    reviewerId: 'sender-1',
    reviewee: mockTraveler,
    revieweeId: 'traveler-1',
    type: ReviewType.SENDER_TO_TRAVELER,
    rating: 5,
    comment: 'Great experience!',
    isAnonymous: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReviewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockMatchRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get<Repository<Review>>(
      getRepositoryToken(Review),
    );
    matchRepository = module.get<Repository<Match>>(getRepositoryToken(Match));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReviewDto = {
      matchId: 'match-1',
      revieweeId: 'traveler-1',
      rating: 5,
      comment: 'Great experience!',
      isAnonymous: false,
    };

    it('should create a review successfully', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);
      mockReviewRepository.findOne.mockResolvedValue(null);
      mockUserRepository.findOne.mockResolvedValue(mockTraveler);
      mockReviewRepository.create.mockReturnValue(mockReview);
      mockReviewRepository.save.mockResolvedValue(mockReview);

      const result = await service.create(createReviewDto, mockSender);

      expect(result).toEqual(mockReview);
      expect(mockMatchRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'match-1' },
      });
      expect(mockReviewRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if match not found', async () => {
      mockMatchRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createReviewDto, mockSender)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if match not completed', async () => {
      const pendingMatch = { ...mockMatch, status: MatchStatus.PENDING };
      mockMatchRepository.findOne.mockResolvedValue(pendingMatch);

      await expect(service.create(createReviewDto, mockSender)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if user not part of match', async () => {
      const otherUser = { id: 'other-user' } as User;
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);

      await expect(service.create(createReviewDto, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if trying to review self', async () => {
      const selfReviewDto = { ...createReviewDto, revieweeId: 'sender-1' };
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);

      await expect(service.create(selfReviewDto, mockSender)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if already reviewed', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);
      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      await expect(service.create(createReviewDto, mockSender)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return all reviews for a user', async () => {
      const reviews = [mockReview];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findByUser('traveler-1');

      expect(result).toEqual(reviews);
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { revieweeId: 'traveler-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      const result = await service.findOne('review-1');

      expect(result).toEqual(mockReview);
      expect(mockReviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'review-1' },
      });
    });

    it('should throw NotFoundException if review not found', async () => {
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('review-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateReviewDto = {
      rating: 4,
      comment: 'Updated comment',
    };

    it('should update a review if user is reviewer', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);
      const updatedReview = { ...mockReview, ...updateReviewDto };
      mockReviewRepository.save.mockResolvedValue(updatedReview);

      const result = await service.update(
        'review-1',
        updateReviewDto,
        mockSender,
      );

      expect(result.rating).toBe(4);
      expect(result.comment).toBe('Updated comment');
      expect(mockReviewRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not reviewer', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);
      const otherUser = { id: 'other-user' } as User;

      await expect(
        service.update('review-1', updateReviewDto, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove review if user is reviewer', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);
      mockReviewRepository.remove.mockResolvedValue(mockReview);

      await service.remove('review-1', mockSender);

      expect(mockReviewRepository.remove).toHaveBeenCalledWith(mockReview);
    });

    it('should throw ForbiddenException if user is not reviewer', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);
      const otherUser = { id: 'other-user' } as User;

      await expect(service.remove('review-1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getAverageRating', () => {
    it('should calculate average rating correctly', async () => {
      const reviews = [
        { ...mockReview, rating: 5 },
        { ...mockReview, rating: 4 },
        { ...mockReview, rating: 5 },
      ];
      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.getAverageRating('traveler-1');

      expect(result).toBe(4.7); // (5+4+5)/3 = 4.666... rounded to 4.7
    });

    it('should return 0 if no reviews', async () => {
      mockReviewRepository.find.mockResolvedValue([]);

      const result = await service.getAverageRating('traveler-1');

      expect(result).toBe(0);
    });
  });
});

