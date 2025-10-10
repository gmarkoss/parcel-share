import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from '../entities/match.entity';
import { Parcel } from '../entities/parcel.entity';
import { Trip } from '../entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Parcel, Trip])],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}

