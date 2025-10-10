import { IsUUID, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateMatchDto {
  @IsUUID()
  parcelId: string;

  @IsUUID()
  tripId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  matchScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

