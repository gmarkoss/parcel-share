import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ParcelsService } from './parcels.service';
import { Parcel, ParcelStatus, ParcelSize } from '../entities/parcel.entity';

describe('ParcelsService', () => {
  let service: ParcelsService;
  let parcelRepository: Repository<Parcel>;
  let eventEmitter: EventEmitter2;

  const mockParcelRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParcelsService,
        {
          provide: getRepositoryToken(Parcel),
          useValue: mockParcelRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<ParcelsService>(ParcelsService);
    parcelRepository = module.get<Repository<Parcel>>(getRepositoryToken(Parcel));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new parcel', async () => {
      const userId = 'user-1';
      const createParcelDto = {
        fromLocation: 'Amsterdam',
        toLocation: 'Brussels',
        fromLat: 52.3676,
        fromLng: 4.9041,
        toLat: 50.8503,
        toLng: 4.3517,
        size: ParcelSize.SMALL,
        desiredPickupDate: '2024-01-01',
        desiredDeliveryDate: '2024-01-02',
      };

      const mockParcel = {
        id: 'parcel-1',
        ...createParcelDto,
        senderId: userId,
        status: ParcelStatus.REQUESTED,
      };

      mockParcelRepository.create.mockReturnValue(mockParcel);
      mockParcelRepository.save.mockResolvedValue(mockParcel);

      const result = await service.create(userId, createParcelDto as any);

      expect(result).toEqual(mockParcel);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('parcel.created', mockParcel);
    });
  });

  describe('findById', () => {
    it('should return a parcel by id', async () => {
      const mockParcel = {
        id: 'parcel-1',
        fromLocation: 'Amsterdam',
        status: ParcelStatus.REQUESTED,
      };

      mockParcelRepository.findOne.mockResolvedValue(mockParcel);

      const result = await service.findById('parcel-1');

      expect(result).toEqual(mockParcel);
    });

    it('should throw NotFoundException if parcel not found', async () => {
      mockParcelRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow();
    });
  });
});


