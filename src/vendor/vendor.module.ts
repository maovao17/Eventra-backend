import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor, VendorSchema } from './schemas/vendor.schema';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ReviewModule } from '../review/review.module';
import { BookingModule } from '../booking/booking.module';
import { RequestModule } from '../request/request.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]), UserModule, forwardRef(() => NotificationModule), forwardRef(() => ReviewModule), forwardRef(() => RequestModule), BookingModule],

  controllers: [VendorController],
  providers: [VendorService, CloudinaryService],
  exports: [VendorService],
})
export class VendorModule {}
