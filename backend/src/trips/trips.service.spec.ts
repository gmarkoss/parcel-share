import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TripsService } from './trips.service';
import { Trip } from '../entities/trip.entity';
import { User } from '../entities/user.entity';
import { TripStatus } from '../common/enums';

describe('TripsService', () => {
  let service: TripsService;
  let tripRepository: Repository<Trip>;
  let eventEmitter: EventEmitter2;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  } as User;

  const mockTrip: Trip = {
    id: 'trip-1',
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
    notes: 'Test trip',
    status: TripStatus.PLANNED,
    travelerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Trip;

  const mockTripRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: getRepositoryToken(Trip),
          useValue: mockTripRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    tripRepository = module.get<Repository<Trip>>(getRepositoryToken(Trip));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTripDto = {
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
      notes: 'Test trip',
    };

    it('should create a trip successfully', async () => {
      mockTripRepository.create.mockReturnValue(mockTrip);
      mockTripRepository.save.mockResolvedValue(mockTrip);

      const result = await service.create('user-1', createTripDto);

      expect(result).toEqual(mockTrip);
      expect(mockTripRepository.create).toHaveBeenCalledWith({
        ...createTripDto,
        travelerId: 'user-1',
        status: TripStatus.PLANNED,
      });
      expect(mockTripRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('trip.created', mockTrip);
    });
  });

  describe('findById', () => {
    it('should return a trip by id', async () => {
      mockTripRepository.findOne.mockResolvedValue(mockTrip);

      const result = await service.findById('trip-1');

      expect(result).toEqual(mockTrip);
      expect(mockTripRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'trip-1' },
        relations: ['traveler', 'parcels', 'parcels.sender'],
      });
    });

    it('should throw NotFoundException if trip not found', async () => {
      mockTripRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('trip-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return all trips for a user', async () => {
      const trips = [mockTrip];
      mockTripRepository.find.mockResolvedValue(trips);

      const result = await service.findByUser('user-1');

      expect(result).toEqual(trips);
      expect(mockTripRepository.find).toHaveBeenCalledWith({
        where: { travelerId: 'user-1' },
        relations: ['parcels'],
        order: { departureTime: 'DESC' },
      });
    });
  });

  describe('cancelTrip', () => {
    it('should cancel trip if user is owner', async () => {
      mockTripRepository.findOne.mockResolvedValue(mockTrip);
      mockTripRepository.save.mockResolvedValue({
        ...mockTrip,
        status: TripStatus.CANCELLED,
      });

      await service.cancelTrip('trip-1', 'user-1');

      expect(mockTripRepository.save).toHaveBeenCalledWith({
        ...mockTrip,
        status: TripStatus.CANCELLED,
      });
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockTripRepository.findOne.mockResolvedValue(mockTrip);

      await expect(service.cancelTrip('trip-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

