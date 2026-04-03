import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingService } from '../booking/booking.service';
import * as admin from 'firebase-admin';
import { AuthenticatedUser } from '../types/auth.types';

@Controller('chats')
export class ChatController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor')
  @Post('init')
  async initChat(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: { bookingId?: string },
  ): Promise<{ chatId: string; initialized: true }> {
    const bookingId = String(body?.bookingId || '').trim();
    if (!bookingId) {
      throw new ForbiddenException('bookingId is required');
    }

    const booking = await this.bookingService.findById(bookingId);
    const actorUserId = req.user.uid;

    if (
      String(booking.customerId) !== actorUserId &&
      String(booking.vendorId) !== actorUserId
    ) {
      throw new ForbiddenException('You do not have access to this booking chat');
    }

    const chatId = `booking-${bookingId}`;
    const chatRef = admin.firestore().collection('chats').doc(chatId);
    const existing = await chatRef.get();

    if (!existing.exists) {
      await chatRef.set({
        bookingId,
        participantIds: [String(booking.customerId), String(booking.vendorId)],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { chatId, initialized: true };
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor')
  @Get(':chatId/verify')
  async verifyAccess(
    @Req() req: { user: AuthenticatedUser },
    @Param('chatId') chatId: string,
  ): Promise<{ allowed: boolean }> {
    try {
      const bookingIdMatch = chatId.match(/^booking-(.+)$/);
      if (!bookingIdMatch) {
        return { allowed: false };
      }

      const bookingId = bookingIdMatch[1];
      const booking = await this.bookingService.findById(bookingId);
      const isAllowed = booking.customerId === req.user.uid ||
                       booking.vendorId === req.user.uid;

      return { allowed: isAllowed };
    } catch {
      return { allowed: false };
    }
  }
}
