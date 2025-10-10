import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Parcel, ParcelStatus } from '../entities/parcel.entity';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { SearchParcelsDto } from './dto/search-parcels.dto';

@Injectable()
export class ParcelsService {
  constructor(
    @InjectRepository(Parcel)
    private readonly parcelRepository: Repository<Parcel>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createParcelDto: CreateParcelDto): Promise<Parcel> {
    const parcel = this.parcelRepository.create({
      ...createParcelDto,
      senderId: userId,
      status: ParcelStatus.REQUESTED,
    });

    const savedParcel = await this.parcelRepository.save(parcel);

    this.eventEmitter.emit('parcel.created', savedParcel);

    return savedParcel;
  }

  async findAll(searchDto: SearchParcelsDto): Promise<Parcel[]> {
    const query = this.parcelRepository.createQueryBuilder('parcel')
      .leftJoinAndSelect('parcel.sender', 'sender')
      .leftJoinAndSelect('parcel.carrier', 'carrier');

    if (searchDto.status) {
      query.andWhere('parcel.status = :status', { status: searchDto.status });
    }

    if (searchDto.fromDate && searchDto.toDate) {
      query.andWhere('parcel.desiredPickupDate BETWEEN :fromDate AND :toDate', {
        fromDate: searchDto.fromDate,
        toDate: searchDto.toDate,
      });
    }

    if (searchDto.size) {
      query.andWhere('parcel.size = :size', { size: searchDto.size });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Parcel> {
    const parcel = await this.parcelRepository.findOne({
      where: { id },
      relations: ['sender', 'carrier', 'trip'],
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    return parcel;
  }

  async findByUser(userId: string): Promise<Parcel[]> {
    return this.parcelRepository.find({
      where: [{ senderId: userId }, { carrierId: userId }],
      relations: ['sender', 'carrier', 'trip'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    userId: string,
    updateStatusDto: UpdateParcelStatusDto,
  ): Promise<Parcel> {
    const parcel = await this.findById(id);

    // Only sender or carrier can update status
    if (parcel.senderId !== userId && parcel.carrierId !== userId) {
      throw new ForbiddenException('You do not have permission to update this parcel');
    }

    const oldStatus = parcel.status;
    parcel.status = updateStatusDto.status;

    const updatedParcel = await this.parcelRepository.save(parcel);

    this.eventEmitter.emit('parcel.status.changed', {
      parcel: updatedParcel,
      oldStatus,
      newStatus: updateStatusDto.status,
    });

    return updatedParcel;
  }

  async acceptParcel(
    parcelId: string,
    carrierId: string,
    tripId: string,
  ): Promise<Parcel> {
    const parcel = await this.findById(parcelId);

    if (parcel.status !== ParcelStatus.REQUESTED) {
      throw new ForbiddenException('This parcel has already been accepted');
    }

    parcel.carrierId = carrierId;
    parcel.tripId = tripId;
    parcel.status = ParcelStatus.ACCEPTED;

    const updatedParcel = await this.parcelRepository.save(parcel);

    this.eventEmitter.emit('parcel.accepted', {
      parcel: updatedParcel,
      carrierId,
      tripId,
    });

    return updatedParcel;
  }

  async cancelParcel(id: string, userId: string): Promise<Parcel> {
    const parcel = await this.findById(id);

    if (parcel.senderId !== userId) {
      throw new ForbiddenException('Only the sender can cancel this parcel');
    }

    if (parcel.status !== ParcelStatus.REQUESTED && parcel.status !== ParcelStatus.ACCEPTED) {
      throw new ForbiddenException('Cannot cancel a parcel that is in transit or delivered');
    }

    parcel.status = ParcelStatus.CANCELLED;

    return this.parcelRepository.save(parcel);
  }
}

