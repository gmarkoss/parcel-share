import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto, UpdateMatchStatusDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '../common';
import { User } from '../entities/user.entity';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto, @CurrentUser() user: User) {
    return this.matchesService.create(createMatchDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.matchesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.matchesService.findOne(id, user.id);
  }

  @Get('parcel/:parcelId')
  findByParcel(@Param('parcelId') parcelId: string, @CurrentUser() user: User) {
    return this.matchesService.findByParcel(parcelId, user.id);
  }

  @Get('trip/:tripId')
  findByTrip(@Param('tripId') tripId: string, @CurrentUser() user: User) {
    return this.matchesService.findByTrip(tripId, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateMatchStatusDto: UpdateMatchStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.matchesService.updateStatus(id, updateMatchStatusDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.matchesService.remove(id, user.id);
  }
}

