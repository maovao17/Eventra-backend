import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { VendorModule } from '../vendor/vendor.module';
import { UserModule } from '../user/user.module';
import { BookingModule } from '../booking/booking.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    VendorModule,
    UserModule,
    BookingModule,
    PaymentModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
