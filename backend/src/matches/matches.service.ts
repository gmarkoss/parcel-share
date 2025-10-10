import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from '../entities/match.entity';
import { Parcel } from '../entities/parcel.entity';
import { Trip } from '../entities/trip.entity';
import { User } from '../entities/user.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Parcel)
    private readonly parcelRepository: Repository<Parcel>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  async create(
    createMatchDto: CreateMatchDto,
    currentUser: User,
  ): Promise<Match> {
    const { parcelId, tripId, matchScore, notes } = createMatchDto;

    // Verify parcel exists and belongs to the current user
    const parcel = await this.parcelRepository.findOne({
      where: { id: parcelId },
      relations: ['sender'],
    });

    if (!parcel) {
      throw new NotFoundException(`Parcel with ID ${parcelId} not found`);
    }

    // Verify trip exists
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['traveler'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }

    // Create match
    const match = this.matchRepository.create({
      parcel,
      parcelId,
      trip,
      tripId,
      sender: parcel.sender,
      senderId: parcel.sender.id,
      traveler: trip.traveler,
      travelerId: trip.traveler.id,
      matchScore,
      notes,
      status: MatchStatus.PENDING,
    });

    return await this.matchRepository.save(match);
  }

  async findAll(userId: string): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [{ senderId: userId }, { travelerId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    // Ensure user is part of the match
    if (match.senderId !== userId && match.travelerId !== userId) {
      throw new ForbiddenException('You do not have access to this match');
    }

    return match;
  }

  async updateStatus(
    id: string,
    updateMatchStatusDto: UpdateMatchStatusDto,
    userId: string,
  ): Promise<Match> {
    const match = await this.findOne(id, userId);

    // Only traveler can accept/reject matches
    if (
      updateMatchStatusDto.status === MatchStatus.ACCEPTED ||
      updateMatchStatusDto.status === MatchStatus.REJECTED
    ) {
      if (match.travelerId !== userId) {
        throw new ForbiddenException(
          'Only the traveler can accept or reject matches',
        );
      }
    }

    match.status = updateMatchStatusDto.status;
    if (updateMatchStatusDto.notes) {
      match.notes = updateMatchStatusDto.notes;
    }

    return await this.matchRepository.save(match);
  }

  async findByParcel(parcelId: string, userId: string): Promise<Match[]> {
    const matches = await this.matchRepository.find({
      where: { parcelId },
      order: { createdAt: 'DESC' },
    });

    // Verify user has access to at least one match
    const hasAccess = matches.some(
      (match) => match.senderId === userId || match.travelerId === userId,
    );

    if (matches.length > 0 && !hasAccess) {
      throw new ForbiddenException('You do not have access to these matches');
    }

    return matches;
  }

  async findByTrip(tripId: string, userId: string): Promise<Match[]> {
    const matches = await this.matchRepository.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });

    // Verify user has access to at least one match
    const hasAccess = matches.some(
      (match) => match.senderId === userId || match.travelerId === userId,
    );

    if (matches.length > 0 && !hasAccess) {
      throw new ForbiddenException('You do not have access to these matches');
    }

    return matches;
  }

  async remove(id: string, userId: string): Promise<void> {
    const match = await this.findOne(id, userId);

    // Only sender can delete a match
    if (match.senderId !== userId) {
      throw new ForbiddenException('Only the sender can delete a match');
    }

    await this.matchRepository.remove(match);
  }
}

