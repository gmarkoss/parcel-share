import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ParcelSize } from '../../common/enums';

export class CreateParcelDto {
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

  @IsEnum(ParcelSize)
  size: ParcelSize;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardAmount?: number;

  @IsDateString()
  desiredPickupDate: string;

  @IsDateString()
  desiredDeliveryDate: string;
}

