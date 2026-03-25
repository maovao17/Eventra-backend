import {
  Controller,
  Get,
  Patch,
  Param,
  Inject,
} from '@nestjs/common';

import { VendorService } from '../vendor/vendor.service';
import { UserService } from '../user/user.service';
import { BookingService } from '../booking/booking.service';
import { PaymentService } from '../payment/payment.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly userService: UserService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
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
    return this.vendorService.approveVendor(id);
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
}
