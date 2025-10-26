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

  // Enable CORS for frontend
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://parcel-share-production.up.railway.app/',
    'https://parcel-share-qpbt-74f523k2v-markos-projects-5a4df66f.vercel.app/',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];
  
  app.enableCors({
    origin: allowedOrigins,
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
