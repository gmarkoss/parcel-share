import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ParcelStatus } from '../../common/enums';

export class UpdateParcelStatusDto {
  @ApiProperty({ 
    enum: ParcelStatus,
    example: ParcelStatus.IN_TRANSIT,
    description: 'Parcel status' 
  })
  @IsEnum(ParcelStatus)
  status: ParcelStatus;
}

