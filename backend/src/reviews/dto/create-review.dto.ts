import {
  IsUUID,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Match ID (must be completed)' })
  @IsUUID()
  matchId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'User being reviewed' })
  @IsUUID()
  revieweeId: string;

  @ApiProperty({ example: 5, description: 'Rating (1-5 stars)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great experience, very professional!', description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: false, description: 'Post review anonymously', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

