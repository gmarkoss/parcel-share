import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '../common';
import { User } from '../entities/user.entity';

@ApiTags('reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review for a completed match' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or already reviewed' })
  @ApiResponse({ status: 403, description: 'Not part of this match' })
  create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'List of all reviews' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reviews for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID to get reviews for' })
  @ApiResponse({ status: 200, description: 'List of user reviews' })
  findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Get('user/:userId/average')
  @ApiOperation({ summary: 'Get average rating for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Average rating',
    schema: { type: 'number', example: 4.5 },
  })
  getAverageRating(@Param('userId') userId: string) {
    return this.reviewsService.getAverageRating(userId);
  }

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Get all reviews for a match' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'List of reviews for the match' })
  findByMatch(@Param('matchId') matchId: string) {
    return this.reviewsService.findByMatch(matchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review details' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only update own reviews' })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete own reviews' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.remove(id, user);
  }
}

