import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request, RequestSchema } from './schemas/request.schema';
import { BookingModule } from '../booking/booking.module';
import { UserModule } from '../user/user.module';
import { VendorModule } from '../vendor/vendor.module';
import { EventModule } from '../event/event.module';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { Event, EventSchema } from '../event/schemas/event.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Booking, BookingSchema } from '../booking/schemas/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
      { name: Event.name, schema: EventSchema },
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    forwardRef(() => BookingModule),
    UserModule,
    VendorModule,
    EventModule,
    AuthModule,
    EventsModule,
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
