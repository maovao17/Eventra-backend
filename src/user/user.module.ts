import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { Vendor, VendorSchema } from '../vendor/schemas/vendor.schema';
import { Booking, BookingSchema } from '../booking/schemas/booking.schema';
import { Request, RequestSchema } from '../request/schemas/request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, FirebaseAuthGuard],
  exports: [UserService],
})
export class UserModule {}
