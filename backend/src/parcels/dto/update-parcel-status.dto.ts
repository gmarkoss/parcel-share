import { IsEnum } from 'class-validator';
import { ParcelStatus } from '../../entities/parcel.entity';

export class UpdateParcelStatusDto {
  @IsEnum(ParcelStatus)
  status: ParcelStatus;
}

