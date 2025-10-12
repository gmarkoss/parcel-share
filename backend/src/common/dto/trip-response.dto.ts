import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class TripResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Trip ID' })
  id: string;

  @ApiProperty({ example: 'New York', description: 'Departure location' })
  fromLocation: string;

  @ApiProperty({ example: 'Los Angeles', description: 'Destination location' })
  toLocation: string;

  @ApiProperty({ example: 40.7128, description: 'Departure latitude' })
  fromLat: number;

  @ApiProperty({ example: -74.006, description: 'Departure longitude' })
  fromLng: number;

  @ApiProperty({ example: 34.0522, description: 'Destination latitude' })
  toLat: number;

  @ApiProperty({ example: -118.2437, description: 'Destination longitude' })
  toLng: number;

  @ApiProperty({ example: 'car', enum: ['car', 'bus', 'train'], description: 'Transport type' })
  transportType: string;

  @ApiProperty({ example: '2025-01-15T08:00:00Z', description: 'Departure time' })
  departureTime: Date;

  @ApiProperty({ example: '2025-01-16T20:00:00Z', description: 'Arrival time' })
  arrivalTime: Date;

  @ApiProperty({ example: 20, description: 'Available capacity (weight in kg)' })
  availableCapacity: number;

  @ApiProperty({ example: 'I have space for medium parcels', description: 'Additional notes', required: false })
  notes?: string;

  @ApiProperty({ 
    example: 'planned', 
    enum: ['planned', 'in_progress', 'completed', 'cancelled'], 
    description: 'Trip status' 
  })
  status: string;

  @ApiProperty({ type: UserResponseDto, description: 'Traveler information' })
  traveler: UserResponseDto;

  @ApiProperty({ example: '2025-01-10T12:00:00Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', description: 'Last update date' })
  updatedAt: Date;
}
