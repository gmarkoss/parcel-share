import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ParcelStatus, ParcelSize } from '../../entities/parcel.entity';

export class SearchParcelsDto {
  @IsOptional()
  @IsEnum(ParcelStatus)
  status?: ParcelStatus;

  @IsOptional()
  @IsEnum(ParcelSize)
  size?: ParcelSize;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

