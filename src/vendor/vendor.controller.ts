import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  private static readonly ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  // ✅ CREATE
  @Post()
  create(@Body() dto: CreateVendorDto) {
    return this.vendorService.create(dto);
  }

  // ✅ GET PROFILE
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return this.vendorService.getByUserId(req.user.uid);
  }

  // ✅ UPDATE PROFILE
  @UseGuards(FirebaseAuthGuard)
  @Patch('me')
  updateMe(@Req() req, @Body() dto: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.uid, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('profile')
  updateProfilePatch(@Req() req, @Body() payload?: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.uid, payload ?? {});
  }

  @UseGuards(FirebaseAuthGuard)
  @Put('profile')
  updateProfile(@Req() req, @Body() payload: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.uid, payload);
  }

  // ✅ DASHBOARD (CRITICAL FIX)
  @UseGuards(FirebaseAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req) {
    const data = await this.vendorService.getDashboard(req.user.uid);

    return (
      data || {
        totalBookings: 0,
        pendingRequests: 0,
        pendingBookings: 0,
        completedBookings: 0,
        revenue: 0,
        monthlyRevenue: 0,
        rating: 0,
      }
    );
  }

  // ================= UPLOAD =================

  @UseGuards(FirebaseAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Req() req) {
    if (!file) throw new BadRequestException('File is required');

    this.validateImageFile(file);

    const fullUrl = await this.saveUpload(file, req);

    return {
      url: new URL(fullUrl).pathname,
      fullUrl,
    };
  }

  // ================= BOOKINGS =================

  @UseGuards(FirebaseAuthGuard)
  @Get('bookings')
  findVendorBookings(@Req() req) {
    return this.vendorService.getVendorBookings(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('bookings/:id/status')
  updateBookingStatus(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.vendorService.updateVendorBookingStatus(
      req.user.uid,
      id,
      body.status,
    );
  }

  // ================= REVIEWS =================

  @UseGuards(FirebaseAuthGuard)
  @Get('reviews')
  getReviews(@Req() req) {
    return this.vendorService.getVendorReviews(req.user.uid);
  }

  // ================= NOTIFICATIONS =================

  @UseGuards(FirebaseAuthGuard)
  @Get('notifications')
  getNotifications(@Req() req) {
    return this.vendorService.getVendorNotifications(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('notifications/:id/read')
  markNotificationRead(@Req() req, @Param('id') id: string) {
    return this.vendorService.markVendorNotificationRead(req.user.uid, id);
  }

  // ================= INTERNAL =================

  private async saveUpload(file: any, req: any) {
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${Math.random()}.jpg`;
    const filePath = join(uploadsDir, fileName);

    await writeFile(filePath, file.buffer);

    return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
  }

  private validateImageFile(file: any) {
    if (!VendorController.ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }
  }
}