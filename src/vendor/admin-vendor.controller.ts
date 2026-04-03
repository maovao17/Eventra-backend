import { Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/vendors')
@UseGuards(FirebaseAuthGuard, AdminGuard)
export class AdminVendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get('pending')
  getPendingVendors() {
    return this.vendorService.getPendingVendors();
  }

  @Put(':id/approve')
  approveVendor(@Param('id') id: string) {
    return this.vendorService.approveVendor(id);
  }
}
