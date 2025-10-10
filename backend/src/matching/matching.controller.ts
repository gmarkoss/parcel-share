import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('parcel/:parcelId')
  async findMatchesForParcel(@Param('parcelId') parcelId: string) {
    return this.matchingService.findMatchesForParcel(parcelId);
  }

  @Get('trip/:tripId')
  async findMatchesForTrip(@Param('tripId') tripId: string) {
    return this.matchingService.findMatchesForTrip(tripId);
  }
}

