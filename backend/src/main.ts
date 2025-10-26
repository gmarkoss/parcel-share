import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  UserResponseDto,
  ParcelResponseDto,
  TripResponseDto,
  MatchResponseDto,
  ReviewResponseDto,
} from './common/dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for frontend with dynamic origin checking
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3004',
    'https://parcel-share-production.up.railway.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if origin matches Vercel pattern (short: parcel-share-*.vercel.app or long preview)
      if (/^https:\/\/parcel-share-[a-z0-9]+(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // For production, you might want to add your main domain here
      if (origin === process.env.PRODUCTION_URL) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI documentation setup
  const config = new DocumentBuilder()
    .setTitle('Parcel Sharing Platform API')
    .setDescription(
      'RESTful API for a peer-to-peer parcel delivery platform connecting travelers with senders',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('parcels', 'Parcel management')
    .addTag('trips', 'Trip management')
    .addTag('matches', 'Match parcels with trips')
    .addTag('reviews', 'User reviews and ratings')
    .addTag('notifications', 'User notifications')
    .addTag('matching', 'Matching algorithm')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

         const document = SwaggerModule.createDocument(app, config, {
           extraModels: [
             UserResponseDto,
             ParcelResponseDto,
             TripResponseDto,
             MatchResponseDto,
             ReviewResponseDto,
           ],
         });
         SwaggerModule.setup('api/docs', app, document, {
           customSiteTitle: 'Parcel Sharing API Docs',
           customfavIcon: 'https://nestjs.com/img/logo_text.svg',
           customCss: '.swagger-ui .topbar { display: none }',
         });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
