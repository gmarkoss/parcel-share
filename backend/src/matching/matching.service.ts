import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcel } from '../entities/parcel.entity';
import { Trip } from '../entities/trip.entity';
import { ParcelStatus, TripStatus } from '../common/enums';

export interface MatchResult {
  trip: Trip;
  parcel: Parcel;
  matchScore: number;
  distanceMatch: boolean;
  timeMatch: boolean;
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Parcel)
    private readonly parcelRepository: Repository<Parcel>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  async findMatchesForParcel(parcelId: string): Promise<MatchResult[]> {
    const parcel = await this.parcelRepository.findOne({
      where: { id: parcelId },
    });

    if (!parcel || parcel.status !== ParcelStatus.REQUESTED) {
      return [];
    }

    // Find trips that are planned and have capacity
    const trips = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.parcels', 'parcels')
      .where('trip.status = :status', { status: TripStatus.PLANNED })
      .andWhere('trip.availableCapacity > 0')
      .getMany();

    const matches: MatchResult[] = [];

    for (const trip of trips) {
      // Check if trip has remaining capacity
      const acceptedParcels = trip.parcels?.filter(
        (p) => p.status === ParcelStatus.ACCEPTED,
      ).length || 0;

      if (acceptedParcels >= trip.availableCapacity) {
        continue;
      }

      // Check distance match (simple proximity check - within ~50km)
      const distanceMatch = this.checkDistanceMatch(parcel, trip);

      // Only consider matches if there's route similarity (required)
      if (!distanceMatch) {
        continue;
      }

      // Check time match (bonus for score, but not required)
      const timeMatch = this.checkTimeMatch(parcel, trip);

      matches.push({
        trip,
        parcel,
        matchScore: this.calculateMatchScore(parcel, trip, distanceMatch, timeMatch),
        distanceMatch,
        timeMatch,
      });
    }

    // Sort by match score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  async findMatchesForTrip(tripId: string): Promise<MatchResult[]> {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['parcels'],
    });

    if (!trip || trip.status !== TripStatus.PLANNED) {
      return [];
    }

    // Check remaining capacity
    const acceptedParcels = trip.parcels?.filter(
      (p) => p.status === ParcelStatus.ACCEPTED,
    ).length || 0;

    if (acceptedParcels >= trip.availableCapacity) {
      return [];
    }

    // Find parcels that are requested
    const parcels = await this.parcelRepository.find({
      where: { status: ParcelStatus.REQUESTED },
    });

    const matches: MatchResult[] = [];

    for (const parcel of parcels) {
      const distanceMatch = this.checkDistanceMatch(parcel, trip);

      // Only consider matches if there's route similarity (required)
      if (!distanceMatch) {
        continue;
      }

      // Check time match (bonus for score, but not required)
      const timeMatch = this.checkTimeMatch(parcel, trip);

      matches.push({
        trip,
        parcel,
        matchScore: this.calculateMatchScore(parcel, trip, distanceMatch, timeMatch),
        distanceMatch,
        timeMatch,
      });
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private checkDistanceMatch(parcel: Parcel, trip: Trip): boolean {
    // Simple proximity check using Haversine formula approximation
    const fromDistanceKm = this.calculateDistance(
      parcel.fromLat,
      parcel.fromLng,
      trip.fromLat,
      trip.fromLng,
    );
    const toDistanceKm = this.calculateDistance(
      parcel.toLat,
      parcel.toLng,
      trip.toLat,
      trip.toLng,
    );

    // Both pickup and delivery should be within 50km of trip endpoints
    return fromDistanceKm <= 50 && toDistanceKm <= 50;
  }

  private checkTimeMatch(parcel: Parcel, trip: Trip): boolean {
    const parcelPickup = new Date(parcel.desiredPickupDate);
    const parcelDelivery = new Date(parcel.desiredDeliveryDate);
    const tripDeparture = new Date(trip.departureTime);
    const tripArrival = new Date(trip.arrivalTime);

    // Trip should start after or on desired pickup date
    // and arrive before or on desired delivery date
    return tripDeparture >= parcelPickup && tripArrival <= parcelDelivery;
  }

  private calculateMatchScore(
    parcel: Parcel,
    trip: Trip,
    distanceMatch: boolean,
    timeMatch: boolean,
  ): number {
    let score = 0;

    if (distanceMatch) {
      score += 50;
      // Add proximity bonus
      const fromDist = this.calculateDistance(
        parcel.fromLat,
        parcel.fromLng,
        trip.fromLat,
        trip.fromLng,
      );
      const toDist = this.calculateDistance(
        parcel.toLat,
        parcel.toLng,
        trip.toLat,
        trip.toLng,
      );
      score += Math.max(0, 25 - fromDist / 2); // Closer is better
      score += Math.max(0, 25 - toDist / 2);
    }

    if (timeMatch) {
      score += 50;
    }

    return score;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Haversine formula to calculate distance in km
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

