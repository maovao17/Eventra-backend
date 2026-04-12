import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AuthenticatedUser } from '../types/auth.types';
import { VendorService } from './vendor.service';
import { NotificationService } from '../notification/notification.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

const uploadsStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(process.cwd(), 'uploads');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname) || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

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

  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: uploadsStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadFile(@UploadedFile() file: any) {
    return {
      fullUrl: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }

  @Post('upload-multiple')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 7, {
    storage: uploadsStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadMultiple(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) {
      return { data: [] };
    }
    return {
      data: files.map(file => ({ url: `/uploads/${file.filename}` })),
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('reviews')
  getReviews(@Req() req: { user: AuthenticatedUser }) {
    return this.vendorService.getVendorReviews(req.user.userId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('bookings')
  getBookings(@Req() req: { user: AuthenticatedUser }) {
    return this.vendorService.getVendorBookings(req.user.userId);
  }

  // NOTE: 'notifications' must be BEFORE ':id' — NestJS matches routes in order
  @UseGuards(FirebaseAuthGuard)
  @Get('notifications')
  async getNotifications(@Req() req: { user: AuthenticatedUser }) {
    const vendor = await this.vendorService.findByUserId(req.user.userId);
    if (!vendor) {
      return [];
    }
    return this.notificationService.findByVendor(String(vendor._id));
  }

  // Parameterised route LAST so it doesn't swallow named routes above
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Patch('approve/:id')
  approve(@Param('id') id: string) {
    return this.vendorService.approveVendor(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('services')
  async updateServices(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: { servicesOffered: string[] }
  ) {
    return this.vendorService.updateProfile(req.user.userId, {
      servicesOffered: body.servicesOffered,
    } as any);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('availability')
  async updateAvailability(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: { blockedDates: string[] }
  ) {
    return this.vendorService.updateProfile(req.user.userId, body as any);
  }
}
