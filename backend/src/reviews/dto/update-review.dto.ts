import { IsInt, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ example: 4, description: 'Updated rating (1-5 stars)', minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 'Updated comment', description: 'Updated review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: true, description: 'Make review anonymous', required: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

