import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [BookingModule],
  controllers: [ChatController],
})
export class ChatModule {}