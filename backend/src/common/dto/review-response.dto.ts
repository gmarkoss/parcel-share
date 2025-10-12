import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { ReviewType } from '../enums';

export class ReviewResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Review ID' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Match ID' })
  matchId: string;

  @ApiProperty({ type: UserResponseDto, description: 'Reviewer information' })
  reviewer: UserResponseDto;

  @ApiProperty({ type: UserResponseDto, description: 'User being reviewed' })
  reviewee: UserResponseDto;

  @ApiProperty({ 
    enum: ReviewType, 
    example: ReviewType.SENDER_TO_TRAVELER,
    description: 'Review type' 
  })
  type: ReviewType;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Rating (1-5 stars)' })
  rating: number;

  @ApiProperty({ example: 'Great experience, very professional!', description: 'Review comment', required: false })
  comment?: string;

  @ApiProperty({ example: false, description: 'Anonymous review flag' })
  isAnonymous: boolean;

  @ApiProperty({ example: '2025-01-10T12:00:00Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', description: 'Last update date' })
  updatedAt: Date;
}
