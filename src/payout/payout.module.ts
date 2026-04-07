import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayoutService } from './payout.service';
import { PayoutController } from './payout.controller';
import { Payout, PayoutSchema } from './schemas/payout.schema';
import { Booking, BookingSchema } from '../booking/schemas/booking.schema';
import { VendorModule } from '../vendor/vendor.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payout.name, schema: PayoutSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    VendorModule,
    AuthModule,
  ],
  controllers: [PayoutController],
  providers: [PayoutService],
  exports: [PayoutService],
})
export class PayoutModule {}
