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
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT environment variable is not set. ' +
        'Set it in Railway to the full JSON content of your serviceAccountKey.json file.',
      );
    }
    let serviceAccount: admin.ServiceAccount;
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT is set but contains invalid JSON. ' +
        'Make sure the value is the raw JSON string from serviceAccountKey.json.',
      );
    }
    (serviceAccount as any).private_key = (serviceAccount as any).private_key?.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
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
    origin: (process.env.CORS_ORIGIN || 'https://eventra-frontend-eight.vercel.app')
      .split(',').map(o => o.trim()).filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
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
