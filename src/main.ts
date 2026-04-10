import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { static as expressStatic, Request } from 'express';
import * as admin from 'firebase-admin';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as express from 'express';

async function bootstrap() {
  if (!admin.apps.length) {
    const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');
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

  app.enableCors({
    origin: 'https://eventra-frontend-eight.vercel.app',
    credentials: true,
  });

  app.use((req, res, next) => {
    res.setHeader(
      'Access-Control-Allow-Origin',
      'https://eventra-frontend-eight.vercel.app'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

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
  app.use('/uploads', express.static(uploadsDir));
  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}

bootstrap();
