import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Trip, TripStatus } from '../entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { SearchTripsDto } from './dto/search-trips.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createTripDto: CreateTripDto): Promise<Trip> {
    const trip = this.tripRepository.create({
      ...createTripDto,
      travelerId: userId,
      status: TripStatus.PLANNED,
    });

    const savedTrip = await this.tripRepository.save(trip);

    this.eventEmitter.emit('trip.created', savedTrip);

    return savedTrip;
  }

  async findAll(searchDto: SearchTripsDto): Promise<Trip[]> {
    const query = this.tripRepository.createQueryBuilder('trip')
      .leftJoinAndSelect('trip.traveler', 'traveler')
      .leftJoinAndSelect('trip.parcels', 'parcels');

    if (searchDto.status) {
      query.andWhere('trip.status = :status', { status: searchDto.status });
    }

    if (searchDto.transportType) {
      query.andWhere('trip.transportType = :transportType', {
        transportType: searchDto.transportType,
      });
    }

    if (searchDto.fromDate && searchDto.toDate) {
      query.andWhere('trip.departureTime BETWEEN :fromDate AND :toDate', {
        fromDate: searchDto.fromDate,
        toDate: searchDto.toDate,
      });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['traveler', 'parcels', 'parcels.sender'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async findByUser(userId: string): Promise<Trip[]> {
    return this.tripRepository.find({
      where: { travelerId: userId },
      relations: ['parcels'],
      order: { departureTime: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    userId: string,
    updateStatusDto: UpdateTripStatusDto,
  ): Promise<Trip> {
    const trip = await this.findById(id);

    if (trip.travelerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this trip');
    }

    const oldStatus = trip.status;
    trip.status = updateStatusDto.status;

    const updatedTrip = await this.tripRepository.save(trip);

    this.eventEmitter.emit('trip.status.changed', {
      trip: updatedTrip,
      oldStatus,
      newStatus: updateStatusDto.status,
    });

    return updatedTrip;
  }

  async cancelTrip(id: string, userId: string): Promise<Trip> {
    const trip = await this.findById(id);

    if (trip.travelerId !== userId) {
      throw new ForbiddenException('Only the traveler can cancel this trip');
    }

    if (trip.status !== TripStatus.PLANNED) {
      throw new ForbiddenException('Cannot cancel a trip that is already in progress or completed');
    }

    trip.status = TripStatus.CANCELLED;

    return this.tripRepository.save(trip);
  }

  async getRemainingCapacity(tripId: string): Promise<number> {
    const trip = await this.findById(tripId);
    const acceptedParcels = trip.parcels?.filter(p => p.status === 'accepted').length || 0;
    return trip.availableCapacity - acceptedParcels;
  }
}

