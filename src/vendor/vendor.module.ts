import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor, VendorSchema } from './schemas/vendor.schema';
import { Booking, BookingSchema } from '../booking/schemas/booking.schema';
import { Request, RequestSchema } from '../request/schemas/request.schema';
import { AdminVendorController } from './admin-vendor.controller';
import { Service, ServiceSchema } from '../service/schemas/service.schema';
import { Review, ReviewSchema } from '../review/schemas/review.schema';
import { Notification, NotificationSchema } from '../notification/schemas/notification.schema';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [VendorController, AdminVendorController],
  providers: [VendorService, FirebaseAuthGuard],
  exports: [VendorService],
})
export class VendorModule {}
