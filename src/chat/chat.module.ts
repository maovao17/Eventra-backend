import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { BookingModule } from '../booking/booking.module';
import { AuthModule } from '../auth/auth.module';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [BookingModule, AuthModule, VendorModule],
  controllers: [ChatController],
})
export class ChatModule {}
