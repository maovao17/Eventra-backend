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
import { VendorService } from '../vendor/vendor.service';
import { RequestService } from '../request/request.service';
import * as admin from 'firebase-admin';
import { AuthenticatedUser } from '../types/auth.types';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly vendorService: VendorService,
    private readonly requestService: RequestService,
  ) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor')
  @Post('init')
  async initChat(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: { bookingId?: string; requestId?: string },
  ): Promise<{ chatId: string; initialized: true }> {
    const actorUserId = req.user.uid;

    // ── Request-based chat (new flow) ──────────────────────────────────
    if (body?.requestId) {
      const requestId = String(body.requestId).trim();
      const request = await this.requestService.findOne(requestId);

      const vendor = await this.vendorService.findOneOrThrow(String(request.vendorId));
      const vendorUserId = String((vendor as any).userId || '');

      if (
        String(request.customerId) !== actorUserId &&
        vendorUserId !== actorUserId
      ) {
        throw new ForbiddenException('You do not have access to this request chat');
      }

      if (request.status !== 'accepted') {
        throw new ForbiddenException('Chat is only available for accepted requests');
      }

      const chatId = `request-${requestId}`;
      const chatRef = admin.firestore().collection('chats').doc(chatId);
      const existing = await chatRef.get();

      if (!existing.exists) {
        await chatRef.set({
          requestId,
          participantIds: [String(request.customerId), vendorUserId],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { chatId, initialized: true };
    }

    // ── Legacy booking-based chat ───────────────────────────────────────
    const bookingId = String(body?.bookingId || '').trim();
    if (!bookingId) {
      throw new ForbiddenException('requestId or bookingId is required');
    }

    const booking = await this.bookingService.findById(bookingId);
    const bookingVendor = await this.vendorService.findOneOrThrow(booking.vendorId);
    const vendorUserId = String((bookingVendor as any).userId || '');

    if (
      String(booking.customerId) !== actorUserId &&
      vendorUserId !== actorUserId
    ) {
      throw new ForbiddenException('You do not have access to this booking chat');
    }

    const chatId = `booking-${bookingId}`;
    const chatRef = admin.firestore().collection('chats').doc(chatId);
    const existing = await chatRef.get();

    if (!existing.exists) {
      await chatRef.set({
        bookingId,
        participantIds: [String(booking.customerId), vendorUserId],
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
      // ── Request-based chat ────────────────────────────────────────────
      const requestIdMatch = chatId.match(/^request-(.+)$/);
      if (requestIdMatch) {
        const requestId = requestIdMatch[1];
        const request = await this.requestService.findOne(requestId);
        const vendor = await this.vendorService.findOneOrThrow(String(request.vendorId));
        const vendorUserId = String((vendor as any).userId || '');
        const isAllowed =
          String(request.customerId) === req.user.uid ||
          vendorUserId === req.user.uid;
        return { allowed: isAllowed };
      }

      // ── Legacy booking-based chat ─────────────────────────────────────
      const bookingIdMatch = chatId.match(/^booking-(.+)$/);
      if (!bookingIdMatch) {
        return { allowed: false };
      }

      const bookingId = bookingIdMatch[1];
      const booking = await this.bookingService.findById(bookingId);
      const bookingVendor = await this.vendorService.findOneOrThrow(booking.vendorId);
      const vendorUserId = String((bookingVendor as any).userId || '');
      const isAllowed =
        String(booking.customerId) === req.user.uid ||
        vendorUserId === req.user.uid;

      return { allowed: isAllowed };
    } catch {
      return { allowed: false };
    }
  }
}
