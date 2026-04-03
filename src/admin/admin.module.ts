import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { VendorModule } from '../vendor/vendor.module';
import { UserModule } from '../user/user.module';
import { BookingModule } from '../booking/booking.module';
import { PaymentModule } from '../payment/payment.module';
import { AuthModule } from '../auth/auth.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    AuthModule,
    VendorModule,
    UserModule,
    BookingModule,
    PaymentModule,
    EventModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
