import { User } from '../../entities/user.entity';
import { Parcel } from '../../entities/parcel.entity';
import { Trip } from '../../entities/trip.entity';
import { Match } from '../../entities/match.entity';
import { Review } from '../../entities/review.entity';
import { 
  UserResponseDto, 
  ParcelResponseDto, 
  TripResponseDto, 
  MatchResponseDto, 
  ReviewResponseDto 
} from '../dto';

export class ResponseMapper {
  static toUserResponse(user: User | any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.name?.split(' ')[0] || user.name, // Map name to firstName
      lastName: user.name?.split(' ').slice(1).join(' ') || '', // Map name to lastName
      phoneNumber: user.phone, // Map phone to phoneNumber
      profilePicture: user.photoUrl, // Map photoUrl to profilePicture
      bio: undefined, // Not in entity yet
      rating: undefined, // Not in entity yet
      isVerified: user.isActive, // Map isActive to isVerified
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toParcelResponse(parcel: Parcel): ParcelResponseDto {
    return {
      id: parcel.id,
      fromLocation: parcel.fromLocation,
      toLocation: parcel.toLocation,
      fromLat: parcel.fromLat,
      fromLng: parcel.fromLng,
      toLat: parcel.toLat,
      toLng: parcel.toLng,
      size: parcel.size,
      description: parcel.description,
      rewardAmount: parcel.rewardAmount,
      desiredPickupDate: parcel.desiredPickupDate,
      desiredDeliveryDate: parcel.desiredDeliveryDate,
      status: parcel.status,
      sender: this.toUserResponse(parcel.sender),
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
    };
  }

  static toTripResponse(trip: Trip): TripResponseDto {
    return {
      id: trip.id,
      fromLocation: trip.fromLocation,
      toLocation: trip.toLocation,
      fromLat: trip.fromLat,
      fromLng: trip.fromLng,
      toLat: trip.toLat,
      toLng: trip.toLng,
      transportType: trip.transportType,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      availableCapacity: trip.availableCapacity,
      notes: trip.notes,
      status: trip.status,
      traveler: this.toUserResponse(trip.traveler),
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }

  static toMatchResponse(match: Match): MatchResponseDto {
    return {
      id: match.id,
      parcel: this.toParcelResponse(match.parcel),
      trip: this.toTripResponse(match.trip),
      sender: this.toUserResponse(match.sender),
      traveler: this.toUserResponse(match.traveler),
      status: match.status,
      matchScore: match.matchScore,
      notes: match.notes,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };
  }

  static toReviewResponse(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      matchId: review.matchId,
      reviewer: this.toUserResponse(review.reviewer),
      reviewee: this.toUserResponse(review.reviewee),
      type: review.type,
      rating: review.rating,
      comment: review.comment,
      isAnonymous: review.isAnonymous,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  static toUserResponseArray(users: User[]): UserResponseDto[] {
    return users.map(user => this.toUserResponse(user));
  }

  static toParcelResponseArray(parcels: Parcel[]): ParcelResponseDto[] {
    return parcels.map(parcel => this.toParcelResponse(parcel));
  }

  static toTripResponseArray(trips: Trip[]): TripResponseDto[] {
    return trips.map(trip => this.toTripResponse(trip));
  }

  static toMatchResponseArray(matches: Match[]): MatchResponseDto[] {
    return matches.map(match => this.toMatchResponse(match));
  }

  static toReviewResponseArray(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map(review => this.toReviewResponse(review));
  }
}
