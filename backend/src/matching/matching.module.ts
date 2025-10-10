import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { Parcel } from '../entities/parcel.entity';
import { Trip } from '../entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parcel, Trip])],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}

