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
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { CloudinaryService } from './cloudinary.service';

const memStorage = memoryStorage();

@Controller('vendors')
export class VendorController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly notificationService: NotificationService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@Req() req: { user: AuthenticatedUser }) {
    return this.vendorService.findByUserId(req.user.userId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: { user: AuthenticatedUser }, @Body() body: UpdateVendorDto) {
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
    storage: memStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filename = `${randomUUID()}`;
    const url = await this.cloudinaryService.uploadBuffer(file.buffer, 'eventra', filename);
    return { fullUrl: url, url };
  }

  @Post('upload-multiple')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 7, {
    storage: memStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { data: [] };
    }
    const urls = await Promise.all(
      files.map(file =>
        this.cloudinaryService.uploadBuffer(file.buffer, 'eventra', randomUUID())
      )
    );
    return { data: urls.map(url => ({ url })) };
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
    if (!vendor) return [];
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

  @Patch('reject/:id')
  reject(@Param('id') id: string) {
    return this.vendorService.rejectVendor(id);
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
