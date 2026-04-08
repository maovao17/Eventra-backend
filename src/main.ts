import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { static as expressStatic, Request } from 'express';
import * as admin from 'firebase-admin';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  if (!admin.apps.length) {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      join(process.cwd(), 'serviceAccountKey.json');

    if (existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
      });
    } else {
      admin.initializeApp();
    }
  }

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp }) => {
              return `${timestamp} [${level}] ${message}`;
            }),
          ),
        }),
      ],
    }),
  });

  app.setGlobalPrefix('api');

  const allowedOrigins = (process.env.CORS_ORIGIN ||
    'https://eventra-frontend-eight.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  });
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (
      origin &&
      allowedOrigins.includes(origin)
    ) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    next();
  });

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', expressStatic(uploadsDir));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}

bootstrap();
