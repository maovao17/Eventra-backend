import { Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { VendorService } from './vendor.service';

@Controller('admin/vendors')
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

  @Patch(':id/verify')
  verifyVendor(@Param('id') id: string) {
    return this.vendorService.approveVendor(id);
  }
}
