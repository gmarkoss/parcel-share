import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MatchStatus } from '../../entities/match.entity';

export class UpdateMatchStatusDto {
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

