import { IsUUID, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Parcel ID' })
  @IsUUID()
  parcelId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Trip ID' })
  @IsUUID()
  tripId: string;

  @ApiProperty({ 
    example: 85, 
    description: 'Match score (0-100, from matching algorithm)', 
    minimum: 0, 
    maximum: 100,
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  matchScore?: number;

  @ApiProperty({ example: 'Great match for this parcel', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

