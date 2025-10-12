import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { ParcelResponseDto } from './parcel-response.dto';
import { TripResponseDto } from './trip-response.dto';
import { MatchStatus } from '../enums';

export class MatchResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Match ID' })
  id: string;

  @ApiProperty({ type: ParcelResponseDto, description: 'Matched parcel' })
  parcel: ParcelResponseDto;

  @ApiProperty({ type: TripResponseDto, description: 'Matched trip' })
  trip: TripResponseDto;

  @ApiProperty({ type: UserResponseDto, description: 'Parcel sender' })
  sender: UserResponseDto;

  @ApiProperty({ type: UserResponseDto, description: 'Trip traveler' })
  traveler: UserResponseDto;

  @ApiProperty({ 
    enum: MatchStatus, 
    example: MatchStatus.PENDING,
    description: 'Match status' 
  })
  status: MatchStatus;

  @ApiProperty({ example: 85, description: 'Match score (0-100)', required: false })
  matchScore?: number;

  @ApiProperty({ example: 'Great match for this parcel', description: 'Additional notes', required: false })
  notes?: string;

  @ApiProperty({ example: '2025-01-10T12:00:00Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', description: 'Last update date' })
  updatedAt: Date;
}
