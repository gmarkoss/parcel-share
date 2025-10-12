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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto, UpdateMatchStatusDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '../common';
import { User } from '../entities/user.entity';

@ApiTags('matches')
@ApiBearerAuth('JWT-auth')
@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new match between parcel and trip' })
  @ApiResponse({ status: 201, description: 'Match created successfully' })
  @ApiResponse({ status: 404, description: 'Parcel or trip not found' })
  create(@Body() createMatchDto: CreateMatchDto, @CurrentUser() user: User) {
    return this.matchesService.create(createMatchDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches for current user' })
  @ApiResponse({ status: 200, description: 'List of matches' })
  findAll(@CurrentUser() user: User) {
    return this.matchesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific match by ID' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.matchesService.findOne(id, user.id);
  }

  @Get('parcel/:parcelId')
  @ApiOperation({ summary: 'Get all matches for a parcel' })
  @ApiParam({ name: 'parcelId', description: 'Parcel ID' })
  @ApiResponse({ status: 200, description: 'List of matches for the parcel' })
  findByParcel(@Param('parcelId') parcelId: string, @CurrentUser() user: User) {
    return this.matchesService.findByParcel(parcelId, user.id);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get all matches for a trip' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'List of matches for the trip' })
  findByTrip(@Param('tripId') tripId: string, @CurrentUser() user: User) {
    return this.matchesService.findByTrip(tripId, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update match status (traveler only can accept/reject)' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match status updated' })
  @ApiResponse({ status: 403, description: 'Only traveler can accept/reject' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateMatchStatusDto: UpdateMatchStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.matchesService.updateStatus(id, updateMatchStatusDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a match (sender only)' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only sender can delete match' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.matchesService.remove(id, user.id);
  }
}

