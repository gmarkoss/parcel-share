import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Match } from '../entities/match.entity';
import { Review } from '../entities/review.entity';
import { MatchStatus } from '../common/enums';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let matchRepository: Repository<Match>;
  let reviewRepository: Repository<Review>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    phone: '1234567890',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  } as User;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockMatchRepository = {
    count: jest.fn(),
  };

  const mockReviewRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    matchRepository = module.get<Repository<Match>>(getRepositoryToken(Match));
    reviewRepository = module.get<Repository<Review>>(getRepositoryToken(Review));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserStatistics', () => {
    it('should calculate user statistics correctly', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockMatchRepository.count.mockResolvedValue(5);
      mockReviewRepository.find.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
      ]);

      const result = await service.getUserStatistics('user-1');

      expect(result).toEqual({
        userId: 'user-1',
        averageRating: 4.7,
        totalReviews: 3,
        completedDeliveries: 5,
        memberSince: mockUser.createdAt,
        isVerified: true,
      });
      expect(mockMatchRepository.count).toHaveBeenCalledWith({
        where: {
          travelerId: 'user-1',
          status: MatchStatus.COMPLETED,
        },
      });
      expect(mockReviewRepository.find).toHaveBeenCalledWith({
        where: { revieweeId: 'user-1' },
      });
    });

    it('should return zero statistics for new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockMatchRepository.count.mockResolvedValue(0);
      mockReviewRepository.find.mockResolvedValue([]);

      const result = await service.getUserStatistics('user-1');

      expect(result).toEqual({
        userId: 'user-1',
        averageRating: 0,
        totalReviews: 0,
        completedDeliveries: 0,
        memberSince: mockUser.createdAt,
        isVerified: true,
      });
    });

    it('should handle unverified user', async () => {
      const unverifiedUser = { ...mockUser, isActive: false };
      mockUserRepository.findOne.mockResolvedValue(unverifiedUser);
      mockMatchRepository.count.mockResolvedValue(0);
      mockReviewRepository.find.mockResolvedValue([]);

      const result = await service.getUserStatistics('user-1');

      expect(result.isVerified).toBe(false);
    });
  });
});
