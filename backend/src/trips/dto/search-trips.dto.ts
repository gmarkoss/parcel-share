import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TripStatus, TransportType } from '../../common/enums';

export class SearchTripsDto {
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsEnum(TransportType)
  transportType?: TransportType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

