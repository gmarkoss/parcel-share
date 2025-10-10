import { IsString } from 'class-validator';

export class AcceptParcelDto {
  @IsString()
  tripId: string;
}

