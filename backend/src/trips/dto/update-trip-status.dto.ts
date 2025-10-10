import { IsEnum } from 'class-validator';
import { TripStatus } from '../../entities/trip.entity';

export class UpdateTripStatusDto {
  @IsEnum(TripStatus)
  status: TripStatus;
}

