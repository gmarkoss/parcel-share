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
): TypeOrmModuleOptions => {
  // Railway provides DATABASE_URL, parse it if available
  const databaseUrl = configService.get<string>('DATABASE_URL');
  
  if (databaseUrl) {
    // Parse DATABASE_URL (postgres://username:password@host:port/database)
    const url = new URL(databaseUrl);
    return {
      type: 'postgres',
      host: url.hostname,
      port: parseInt(url.port, 10),
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      entities: [User, Parcel, Trip, Notification, Match, Review],
      synchronize: true, // Temporarily enabled for Railway deployment
      logging: configService.get<string>('NODE_ENV') === 'development',
      ssl:
        configService.get<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }
  
  // Fallback to individual environment variables
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_DATABASE', 'parcel_sharing'),
    entities: [User, Parcel, Trip, Notification, Match, Review],
    synchronize: true, // Temporarily enabled for Railway deployment
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl:
      configService.get<string>('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };
};

