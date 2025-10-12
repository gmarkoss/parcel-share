import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  lastName: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Profile picture URL', required: false })
  profilePicture?: string;

  @ApiProperty({ example: 'Travel enthusiast and parcel delivery helper', description: 'User bio', required: false })
  bio?: string;

  @ApiProperty({ example: 4.5, description: 'Average rating', required: false })
  rating?: number;

  @ApiProperty({ example: true, description: 'Email verified status' })
  isVerified: boolean;

  @ApiProperty({ example: '2025-01-10T12:00:00Z', description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', description: 'Last update date' })
  updatedAt: Date;
}
