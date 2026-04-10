import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AuthenticatedUser } from '../types/auth.types';
import { VendorService } from './vendor.service';
import { NotificationService } from '../notification/notification.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('vendors')
export class VendorController {
constructor(
  private readonly vendorService: VendorService,
  private readonly notificationService: NotificationService
) { }

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

  @Get('all')
  findAll() {
    return this.vendorService.getAllVendors();
  }

  @Get()
  findApproved() {
    return this.vendorService.findAllCompleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any) {
    return {
      fullUrl: `/uploads/${file.filename}`,
      filename: file.filename
    };
  }

  @Post('upload-multiple')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('files'))
  uploadMultiple(@UploadedFile() file: any) {
    return {
      data: [{ url: `/uploads/${file.filename}` }]
    };
  }

@Patch('approve/:id')
  approve(@Param('id') id: string) {
    return this.vendorService.approveVendor(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('notifications')
  async getNotifications(@Req() req: { user: AuthenticatedUser }) {
    const vendor = await this.vendorService.findByUserId(req.user.userId);
    if (!vendor) {
      return [];
    }
    return this.notificationService.findByVendor(String(vendor._id));
  }
}

