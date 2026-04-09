import { Module } from '@nestjs/common';
import { VendorModule } from './vendor/vendor.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ServiceModule } from './service/service.module';
import { CartModule } from './cart/cart.module';
import { BookingModule } from './booking/booking.module';
import { EventModule } from './event/event.module';
import { RequestModule } from './request/request.module';
import { PaymentModule } from './payment/payment.module';
import { PayoutModule } from './payout/payout.module';
import { NotificationModule } from './notification/notification.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    VendorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URI: Joi.string().uri().default('mongodb://mongo:NBtnHsntwJMKkCiAVpiMwkxWZTRkKsCy@mongodb.railway.internal:27017/eventra'),
        PORT: Joi.number().default(3002),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000,https://eventra-frontend-eight.vercel.app'),
        RAZORPAY_KEY_ID: Joi.string().required(),
        RAZORPAY_KEY_SECRET: Joi.string().required(),
        FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().optional(),
      }),
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 30,
        },
      ],
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
    AdminModule,
    EventsModule,
    MongooseModule.forRoot(
      process.env.DB_URI ?? 'mongodb://localhost:27017/eventra',
    ),
    UserModule,
    ServiceModule,
    CartModule,
    VendorModule,
    BookingModule,
    EventModule,
    RequestModule,
    PaymentModule,
    ReviewModule,
    PayoutModule,
    NotificationModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
