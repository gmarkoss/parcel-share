import {
  IsUUID,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  matchId: string;

  @IsUUID()
  revieweeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

