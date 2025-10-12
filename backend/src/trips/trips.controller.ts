import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto, UpdateTripStatusDto, SearchTripsDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '../common';
import { User } from '../entities/user.entity';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(user.id, createTripDto);
  }

  @Get()
  async findAll(@Query() searchDto: SearchTripsDto) {
    return this.tripsService.findAll(searchDto);
  }

  @Get('my-trips')
  async findMyTrips(@CurrentUser() user: User) {
    return this.tripsService.findByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripsService.findById(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateStatusDto: UpdateTripStatusDto,
  ) {
    return this.tripsService.updateStatus(id, user.id, updateStatusDto);
  }

  @Delete(':id')
  async cancelTrip(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tripsService.cancelTrip(id, user.id);
  }

  @Get(':id/capacity')
  async getRemainingCapacity(@Param('id') id: string) {
    const capacity = await this.tripsService.getRemainingCapacity(id);
    return { remainingCapacity: capacity };
  }
}

