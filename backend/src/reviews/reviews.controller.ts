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
import { ReviewResponseDto } from '../common/dto';
import { ResponseMapper } from '../common/mappers/response.mapper';
import { User } from '../entities/user.entity';

@ApiTags('reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review for a completed match' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: ReviewResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or already reviewed' })
  @ApiResponse({ status: 403, description: 'Not part of this match' })
  async create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
    const review = await this.reviewsService.create(createReviewDto, user);
    return ResponseMapper.toReviewResponse(review);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'List of all reviews', type: [ReviewResponseDto] })
  async findAll() {
    const reviews = await this.reviewsService.findAll();
    return ResponseMapper.toReviewResponseArray(reviews);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reviews for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID to get reviews for' })
  @ApiResponse({ status: 200, description: 'List of user reviews', type: [ReviewResponseDto] })
  async findByUser(@Param('userId') userId: string) {
    const reviews = await this.reviewsService.findByUser(userId);
    return ResponseMapper.toReviewResponseArray(reviews);
  }

  @Get('user/:userId/average')
  @ApiOperation({ summary: 'Get average rating for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Average rating for the user',
    schema: {
      properties: {
        userId: { type: 'string' },
        averageRating: { type: 'number', example: 4.5 },
        totalReviews: { type: 'number', example: 12 }
      }
    }
  })
  async getAverageRating(@Param('userId') userId: string) {
    return this.reviewsService.getAverageRating(userId);
  }

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Get all reviews for a match' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'List of reviews for the match', type: [ReviewResponseDto] })
  async findByMatch(@Param('matchId') matchId: string) {
    const reviews = await this.reviewsService.findByMatch(matchId);
    return ResponseMapper.toReviewResponseArray(reviews);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review details', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Can only view own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const review = await this.reviewsService.findOne(id, user.id);
    return ResponseMapper.toReviewResponse(review);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Can only update own reviews' })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    const review = await this.reviewsService.update(id, updateReviewDto, user.id);
    return ResponseMapper.toReviewResponse(review);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete own reviews' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.reviewsService.remove(id, user.id);
    return { message: 'Review deleted successfully' };
  }
}

