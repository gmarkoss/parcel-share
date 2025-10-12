import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Match } from '../entities/match.entity';
import { User } from '../entities/user.entity';
import { ReviewType, MatchStatus } from '../common/enums';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    currentUser: User,
  ): Promise<Review> {
    const { matchId, revieweeId, rating, comment, isAnonymous } =
      createReviewDto;

    // Verify match exists and is completed
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status !== MatchStatus.COMPLETED) {
      throw new BadRequestException(
        'Can only review completed matches',
      );
    }

    // Verify user is part of the match
    if (match.senderId !== currentUser.id && match.travelerId !== currentUser.id) {
      throw new ForbiddenException('You are not part of this match');
    }

    // Verify reviewee is the other party
    if (
      revieweeId !== match.senderId &&
      revieweeId !== match.travelerId
    ) {
      throw new BadRequestException('Reviewee must be part of the match');
    }

    if (revieweeId === currentUser.id) {
      throw new BadRequestException('Cannot review yourself');
    }

    // Determine review type
    const type =
      currentUser.id === match.senderId
        ? ReviewType.SENDER_TO_TRAVELER
        : ReviewType.TRAVELER_TO_SENDER;

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: {
        matchId,
        reviewerId: currentUser.id,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this match',
      );
    }

    // Get reviewee
    const reviewee = await this.userRepository.findOne({
      where: { id: revieweeId },
    });

    if (!reviewee) {
      throw new NotFoundException(`User with ID ${revieweeId} not found`);
    }

    // Create review
    const review = this.reviewRepository.create({
      match,
      matchId,
      reviewer: currentUser,
      reviewerId: currentUser.id,
      reviewee,
      revieweeId,
      type,
      rating,
      comment,
      isAnonymous: isAnonymous || false,
    });

    return await this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { revieweeId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByMatch(matchId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { matchId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, currentUserId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Only reviewer can view their own review (or make this public if needed)
    if (review.reviewerId !== currentUserId && review.revieweeId !== currentUserId) {
      throw new ForbiddenException('You can only view reviews you are part of');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    currentUserId: string,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Only reviewer can update their own review
    if (review.reviewerId !== currentUserId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);

    return await this.reviewRepository.save(review);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Only reviewer can delete their own review
    if (review.reviewerId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
  }

  async getAverageRating(userId: string): Promise<{ userId: string; averageRating: number; totalReviews: number }> {
    const reviews = await this.findByUser(userId);

    if (reviews.length === 0) {
      return {
        userId,
        averageRating: 0,
        totalReviews: 0,
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
    
    return {
      userId,
      averageRating,
      totalReviews: reviews.length,
    };
  }
}

