import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Parcel } from '../entities/parcel.entity';
import { Trip } from '../entities/trip.entity';
import { Notification } from '../entities/notification.entity';
import { Match } from '../entities/match.entity';
import { Review } from '../entities/review.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_DATABASE', 'parcel_sharing'),
  entities: [User, Parcel, Trip, Notification, Match, Review],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl:
    configService.get<string>('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

