import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class ParcelResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Parcel ID' })
  id: string;

  @ApiProperty({ example: 'New York', description: 'Pickup location' })
  fromLocation: string;

  @ApiProperty({ example: 'Los Angeles', description: 'Delivery location' })
  toLocation: string;

  @ApiProperty({ example: 40.7128, description: 'Pickup latitude' })
  fromLat: number;

  @ApiProperty({ example: -74.006, description: 'Pickup longitude' })
  fromLng: number;

  @ApiProperty({ example: 34.0522, description: 'Delivery latitude' })
  toLat: number;

  @ApiProperty({ example: -118.2437, description: 'Delivery longitude' })
  toLng: number;

  @ApiProperty({ example: 'medium', enum: ['small', 'medium', 'large'], description: 'Parcel size' })
  size: string;

  @ApiProperty({ example: 'Electronics package', description: 'Parcel description' })
  description: string;

  @ApiProperty({ example: 50, description: 'Reward amount in dollars' })
  rewardAmount: number;

  @ApiProperty({ example: '2025-01-15T10:00:00Z', description: 'Desired pickup date' })
  desiredPickupDate: Date;

  @ApiProperty({ example: '2025-01-20T18:00:00Z', description: 'Desired delivery date' })
  desiredDeliveryDate: Date;

  @ApiProperty({ 
    example: 'requested', 
    enum: ['requested', 'accepted', 'in_transit', 'delivered', 'cancelled'], 
    description: 'Parcel status' 
  })
  status: string;

  @ApiProperty({ type: UserResponseDto, description: 'Sender information' })
  sender: UserResponseDto;

  @ApiProperty({ example: '2025-01-10T12:00:00Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', description: 'Last update date' })
  updatedAt: Date;
}
