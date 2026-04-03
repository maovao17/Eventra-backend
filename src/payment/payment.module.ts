import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { BookingModule } from '../booking/booking.module';
import { RequestModule } from '../request/request.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PayoutModule } from '../payout/payout.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    BookingModule,
    RequestModule,
    UserModule,
    AuthModule,
    PayoutModule,
    NotificationModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
