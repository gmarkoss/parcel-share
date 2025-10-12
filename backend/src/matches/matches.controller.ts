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
import { MatchResponseDto } from '../common/dto';
import { ResponseMapper } from '../common/mappers/response.mapper';
import { User } from '../entities/user.entity';

@ApiTags('matches')
@ApiBearerAuth('JWT-auth')
@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new match between parcel and trip' })
  @ApiResponse({ status: 201, description: 'Match created successfully', type: MatchResponseDto })
  @ApiResponse({ status: 404, description: 'Parcel or trip not found' })
  async create(@Body() createMatchDto: CreateMatchDto, @CurrentUser() user: User) {
    const match = await this.matchesService.create(createMatchDto, user);
    return ResponseMapper.toMatchResponse(match);
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches for current user' })
  @ApiResponse({ status: 200, description: 'List of matches', type: [MatchResponseDto] })
  async findAll(@CurrentUser() user: User) {
    const matches = await this.matchesService.findAll(user.id);
    return ResponseMapper.toMatchResponseArray(matches);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific match by ID' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match details', type: MatchResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const match = await this.matchesService.findOne(id, user.id);
    return ResponseMapper.toMatchResponse(match);
  }

  @Get('parcel/:parcelId')
  @ApiOperation({ summary: 'Get all matches for a parcel' })
  @ApiParam({ name: 'parcelId', description: 'Parcel ID' })
  @ApiResponse({ status: 200, description: 'List of matches for the parcel', type: [MatchResponseDto] })
  async findByParcel(@Param('parcelId') parcelId: string, @CurrentUser() user: User) {
    const matches = await this.matchesService.findByParcel(parcelId, user.id);
    return ResponseMapper.toMatchResponseArray(matches);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get all matches for a trip' })
  @ApiParam({ name: 'tripId', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'List of matches for the trip', type: [MatchResponseDto] })
  async findByTrip(@Param('tripId') tripId: string, @CurrentUser() user: User) {
    const matches = await this.matchesService.findByTrip(tripId, user.id);
    return ResponseMapper.toMatchResponseArray(matches);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update match status (traveler only can accept/reject)' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match status updated', type: MatchResponseDto })
  @ApiResponse({ status: 403, description: 'Only traveler can accept/reject' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateMatchStatusDto: UpdateMatchStatusDto,
    @CurrentUser() user: User,
  ) {
    const match = await this.matchesService.updateStatus(id, updateMatchStatusDto, user.id);
    return ResponseMapper.toMatchResponse(match);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a match (sender only)' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only sender can delete match' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.matchesService.remove(id, user.id);
    return { message: 'Match deleted successfully' };
  }
}

