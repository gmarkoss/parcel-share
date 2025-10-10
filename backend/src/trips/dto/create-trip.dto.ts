import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { TransportType } from '../../entities/trip.entity';

export class CreateTripDto {
  @IsString()
  fromLocation: string;

  @IsString()
  toLocation: string;

  @IsNumber()
  fromLat: number;

  @IsNumber()
  fromLng: number;

  @IsNumber()
  toLat: number;

  @IsNumber()
  toLng: number;

  @IsEnum(TransportType)
  transportType: TransportType;

  @IsDateString()
  departureTime: string;

  @IsDateString()
  arrivalTime: string;

  @IsNumber()
  @Min(1)
  availableCapacity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

