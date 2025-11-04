import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { Match } from '../entities/match.entity';
import { Review } from '../entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Match, Review])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}


