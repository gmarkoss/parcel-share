import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Match } from '../entities/match.entity';
import { Review } from '../entities/review.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MatchStatus } from '../common/enums';

export interface UserStatistics {
  userId: string;
  averageRating: number;
  totalReviews: number;
  completedDeliveries: number;
  memberSince: Date;
  isVerified: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    Object.assign(user, updateProfileDto);

    return this.userRepository.save(user);
  }

  async getProfile(userId: string): Promise<User> {
    return this.findById(userId);
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const user = await this.findById(userId);

    // Calculate completed deliveries (matches where user is traveler and status is COMPLETED)
    const completedDeliveries = await this.matchRepository.count({
      where: {
        travelerId: userId,
        status: MatchStatus.COMPLETED,
      },
    });

    // Calculate average rating from reviews
    const reviews = await this.reviewRepository.find({
      where: { revieweeId: userId },
    });

    let averageRating = 0;
    let totalReviews = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
      totalReviews = reviews.length;
    }

    // Determine verification status (user has email and optionally phone)
    const isVerified = !!user.email && user.isActive;

    return {
      userId: user.id,
      averageRating,
      totalReviews,
      completedDeliveries,
      memberSince: user.createdAt,
      isVerified,
    };
  }
}


