import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { static as expressStatic } from 'express';
import * as admin from 'firebase-admin';
import * as path from 'path';

async function bootstrap() {
  admin.initializeApp({
  credential: admin.credential.cert(
    require(path.join(__dirname, '../serviceAccountKey.json'))
  ),
});

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', expressStatic(uploadsDir));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
