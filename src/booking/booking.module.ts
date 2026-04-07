import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Vendor, VendorSchema } from '../vendor/schemas/vendor.schema';
import { Event, EventSchema } from '../event/schemas/event.schema';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';
import { RequestModule } from '../request/request.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    forwardRef(() => RequestModule),
    UserModule,
    NotificationModule,
    AuthModule,
    EventsModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
