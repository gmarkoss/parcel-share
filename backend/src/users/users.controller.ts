import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard, CurrentUser } from '../common';
import { UserResponseDto } from '../common/dto';
import { ResponseMapper } from '../common/mappers/response.mapper';
import { User } from '../entities/user.entity';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: UserResponseDto })
  async getProfile(@CurrentUser() user: User) {
    const userProfile = await this.usersService.getProfile(user.id);
    return ResponseMapper.toUserResponse(userProfile);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserResponseDto })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, updateProfileDto);
    return ResponseMapper.toUserResponse(updatedUser);
  }

  @Get(':userId/statistics')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User statistics',
    schema: {
      properties: {
        userId: { type: 'string' },
        averageRating: { type: 'number' },
        totalReviews: { type: 'number' },
        completedDeliveries: { type: 'number' },
        memberSince: { type: 'string', format: 'date-time' },
        isVerified: { type: 'boolean' },
      },
    },
  })
  async getUserStatistics(@Param('userId') userId: string) {
    return await this.usersService.getUserStatistics(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User profile', type: UserResponseDto })
  async getUserById(@Param('userId') userId: string) {
    const userProfile = await this.usersService.getProfile(userId);
    return ResponseMapper.toUserResponse(userProfile);
  }
}

