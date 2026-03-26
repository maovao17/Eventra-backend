import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ServiceModule } from './service/service.module';
import { CartModule } from './cart/cart.module';
import { VendorModule } from './vendor/vendor.module';
import { BookingModule } from './booking/booking.module';
import { EventModule } from './event/event.module';
import { RequestModule } from './request/request.module';
import { PaymentModule } from './payment/payment.module';
import { PayoutModule } from './payout/payout.module';
import { NotificationModule } from './notification/notification.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AdminModule,
    MongooseModule.forRoot(
      process.env.DB_URI || 'mongodb://localhost:27017/eventra',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
