import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '../../common/enums';

export class UpdateTripStatusDto {
  @ApiProperty({ 
    enum: TripStatus,
    example: TripStatus.IN_PROGRESS,
    description: 'Trip status' 
  })
  @IsEnum(TripStatus)
  status: TripStatus;
}

