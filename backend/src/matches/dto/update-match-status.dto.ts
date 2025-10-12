import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from '../../entities/match.entity';

export class UpdateMatchStatusDto {
  @ApiProperty({ 
    enum: MatchStatus, 
    example: MatchStatus.ACCEPTED,
    description: 'New match status'
  })
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @ApiProperty({ example: 'Accepted, looking forward to it!', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

