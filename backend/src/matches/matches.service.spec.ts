import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match, MatchStatus } from '../entities/match.entity';
import { Parcel } from '../entities/parcel.entity';
import { Trip } from '../entities/trip.entity';
import { User } from '../entities/user.entity';

describe('MatchesService', () => {
  let service: MatchesService;
  let matchRepository: Repository<Match>;
  let parcelRepository: Repository<Parcel>;
  let tripRepository: Repository<Trip>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '1234567890',
  } as User;

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

  const mockParcel: Parcel = {
    id: 'parcel-1',
    sender: mockSender,
    senderId: 'sender-1',
  } as Parcel;

  const mockTrip: Trip = {
    id: 'trip-1',
    traveler: mockTraveler,
    travelerId: 'traveler-1',
  } as Trip;

  const mockMatch: Match = {
    id: 'match-1',
    parcel: mockParcel,
    parcelId: 'parcel-1',
    trip: mockTrip,
    tripId: 'trip-1',
    sender: mockSender,
    senderId: 'sender-1',
    traveler: mockTraveler,
    travelerId: 'traveler-1',
    status: MatchStatus.PENDING,
    matchScore: 85,
    notes: 'Test match',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMatchRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockParcelRepository = {
    findOne: jest.fn(),
  };

  const mockTripRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getRepositoryToken(Match),
          useValue: mockMatchRepository,
        },
        {
          provide: getRepositoryToken(Parcel),
          useValue: mockParcelRepository,
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: mockTripRepository,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    matchRepository = module.get<Repository<Match>>(getRepositoryToken(Match));
    parcelRepository = module.get<Repository<Parcel>>(
      getRepositoryToken(Parcel),
    );
    tripRepository = module.get<Repository<Trip>>(getRepositoryToken(Trip));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createMatchDto = {
      parcelId: 'parcel-1',
      tripId: 'trip-1',
      matchScore: 85,
      notes: 'Test match',
    };

    it('should create a match successfully', async () => {
      mockParcelRepository.findOne.mockResolvedValue(mockParcel);
      mockTripRepository.findOne.mockResolvedValue(mockTrip);
      mockMatchRepository.create.mockReturnValue(mockMatch);
      mockMatchRepository.save.mockResolvedValue(mockMatch);

      const result = await service.create(createMatchDto, mockUser);

      expect(result).toEqual(mockMatch);
      expect(mockParcelRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'parcel-1' },
        relations: ['sender'],
      });
      expect(mockTripRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'trip-1' },
        relations: ['traveler'],
      });
      expect(mockMatchRepository.create).toHaveBeenCalled();
      expect(mockMatchRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if parcel not found', async () => {
      mockParcelRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createMatchDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if trip not found', async () => {
      mockParcelRepository.findOne.mockResolvedValue(mockParcel);
      mockTripRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createMatchDto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all matches for a user', async () => {
      const matches = [mockMatch];
      mockMatchRepository.find.mockResolvedValue(matches);

      const result = await service.findAll('user-1');

      expect(result).toEqual(matches);
      expect(mockMatchRepository.find).toHaveBeenCalledWith({
        where: [{ senderId: 'user-1' }, { travelerId: 'user-1' }],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a match if user has access', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);

      const result = await service.findOne('match-1', 'sender-1');

      expect(result).toEqual(mockMatch);
      expect(mockMatchRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'match-1' },
      });
    });

    it('should throw NotFoundException if match not found', async () => {
      mockMatchRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('match-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user not part of match', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);

      await expect(service.findOne('match-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateStatus', () => {
    const updateDto = {
      status: MatchStatus.ACCEPTED,
      notes: 'Updated notes',
    };

    it('should update match status if traveler accepts', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);
      const updatedMatch = { ...mockMatch, status: MatchStatus.ACCEPTED };
      mockMatchRepository.save.mockResolvedValue(updatedMatch);

      const result = await service.updateStatus(
        'match-1',
        updateDto,
        'traveler-1',
      );

      expect(result.status).toBe(MatchStatus.ACCEPTED);
      expect(mockMatchRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-traveler tries to accept', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);

      await expect(
        service.updateStatus('match-1', updateDto, 'sender-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove match if user is sender', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);
      mockMatchRepository.remove.mockResolvedValue(mockMatch);

      await service.remove('match-1', 'sender-1');

      expect(mockMatchRepository.remove).toHaveBeenCalledWith(mockMatch);
    });

    it('should throw ForbiddenException if user is not sender', async () => {
      mockMatchRepository.findOne.mockResolvedValue(mockMatch);

      await expect(service.remove('match-1', 'traveler-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

