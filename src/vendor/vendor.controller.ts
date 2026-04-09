import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AuthenticatedUser } from '../types/auth.types';
import { VendorService } from './vendor.service';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@Req() req: { user: AuthenticatedUser }) {
    return this.vendorService.findByUserId(req.user.userId);
  }

@UseGuards(FirebaseAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: { user: AuthenticatedUser }, @Body() body: UpdateVendorDto) {
    console.log("Saving vendor profile - UID:", req.user.userId, "Data:", body);
    return this.vendorService.updateProfile(req.user.userId, body);
  }

  @Get()
  findAll() {
    return this.vendorService.findAllCompleted();
  }
}
