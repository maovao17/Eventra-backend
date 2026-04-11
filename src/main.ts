import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { static as expressStatic } from 'express';
import * as admin from 'firebase-admin';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  if (!admin.apps.length) {
    const serviceAccountPath = join(process.cwd(), 'src/firebase/serviceAccountKey.json');
    const raw = readFileSync(serviceAccountPath, 'utf8');
    let serviceAccount = JSON.parse(raw);
    
    // Fix private_key newlines (same as original env logic)
    (serviceAccount as any).private_key = (serviceAccount as any).private_key?.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log('✅ Firebase Admin initialized from serviceAccountKey.json');
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
  
  app.use('/uploads', expressStatic(uploadsDir));
  
  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
  console.log(`🚀 Backend running on port ${Number(process.env.PORT) || 3000}`);
}

bootstrap();

