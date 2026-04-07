import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { Booking, BookingSchema } from '../booking/schemas/booking.schema';
import { AuthModule } from '../auth/auth.module';
import { VendorModule } from '../vendor/vendor.module';
import { UserModule } from '../user/user.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    AuthModule,
    VendorModule,
    UserModule,
    EventsModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
