import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AdminGuard } from '../auth/admin.guard';
import { VendorService } from '../vendor/vendor.service';
import { UserService } from '../user/user.service';
import { BookingService } from '../booking/booking.service';
import { PaymentService } from '../payment/payment.service';
import { EventService } from '../event/event.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CreateEventDto } from '../event/dto/create-event.dto';
import { UpdateEventDto } from '../event/dto/update-event.dto';

@Controller('admin')
@UseGuards(FirebaseAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly userService: UserService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    private readonly eventService: EventService,
  ) {}

  @Get('users')
  async getUsers() {
    return this.userService.findAll();
  }

  @Get('vendors')
  async getVendors() {
    return this.vendorService.getAllVendors();
  }

  @Patch('vendors/:id/approve')
  async approveVendor(@Param('id') id: string) {
    const vendor = await this.vendorService.approveVendor(id);
    // Also update the User document so validateVendorActor checks pass
    if (vendor && (vendor as any).userId) {
      await this.userService.setVendorStatus((vendor as any).userId, 'approved').catch(() => null);
    }
    return vendor;
  }

  @Patch('vendors/:id/reject')
  async rejectVendor(@Param('id') id: string) {
    return this.vendorService.rejectVendor(id);
  }

  @Get('bookings')
  async getBookings() {
    return this.bookingService.findAll();
  }

  @Get('payments')
  async getPayments() {
    return this.paymentService.findAll();
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete('users/:id')
  async removeUser(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('events')
  async getEvents() {
    return this.eventService.findAll();
  }

  @Post('events')
  async createEvent(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @Patch('events/:id')
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(id, dto);
  }

  @Delete('events/:id')
  async removeEvent(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
