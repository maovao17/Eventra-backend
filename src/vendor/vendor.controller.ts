import {
  BadRequestException,
  Body,
  Controller,
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedUser } from '../types/auth.types';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  private static readonly ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  // ✅ CREATE
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Post()
  async create(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: CreateVendorDto,
  ) {
    if (req.user.role === 'vendor') {
      const user = await this.vendorService.getApprovedVendorUserOrThrow(
        req.user.userId,
      );

      if (user.status !== 'approved') {
        throw new BadRequestException('Vendor account not approved');
      }
    }

    return this.vendorService.create({
      ...dto,
      userId: req.user.role === 'admin' ? dto.userId : req.user.userId,
    });
  }

  @Get()
  findAll() {
    return this.vendorService.findPublic();
  }

  @Get('by-services')
  findByServices(@Query('services') services?: string) {
    return this.vendorService.findByServices(services);
  }

  // ✅ GET PROFILE
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get('me')
  getMe(@Req() req: { user: AuthenticatedUser }) {
    return this.vendorService.getByUserId(req.user.userId);
  }

  // ✅ UPDATE PROFILE
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Patch('me')
  updateMe(@Req() req: { user: AuthenticatedUser }, @Body() dto: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.userId, dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Patch('profile')
  updateProfilePatch(@Req() req: { user: AuthenticatedUser }, @Body() payload?: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.userId, payload ?? {});
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Put('profile')
  updateProfile(@Req() req: { user: AuthenticatedUser }, @Body() payload: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.userId, payload);
  }

  // ✅ DASHBOARD (CRITICAL FIX)
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get('dashboard')
  async getDashboard(@Req() req: { user: AuthenticatedUser }) {
    const data = await this.vendorService.getDashboard(req.user.userId);

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

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
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

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 7))
  async uploadMultiple(@UploadedFiles() files: any[], @Req() req) {
    if (!files?.length) throw new BadRequestException('Files are required');

    const uploaded: Array<{ url: string; fullUrl: string }> = [];
    for (const file of files) {
      this.validateImageFile(file);
      const fullUrl = await this.saveUpload(file, req);
      uploaded.push({
        url: new URL(fullUrl).pathname,
        fullUrl,
      });
    }

    return uploaded;
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Post('portfolio')
  @UseInterceptors(FilesInterceptor('files', 7))
  async uploadPortfolio(@UploadedFiles() files: any[], @Req() req) {
    if (!files?.length) throw new BadRequestException('Files are required');

    const urls: string[] = [];
    for (const file of files) {
      this.validateImageFile(file);
      const fullUrl = await this.saveUpload(file, req);
      urls.push(new URL(fullUrl).pathname);
    }

    return this.vendorService.addPortfolioItems(req.user.uid, urls);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Post('services')
  assignServices(@Req() req, @Body() body: { serviceIds?: string[] }) {
    return this.vendorService.assignServices(
      req.user.uid,
      Array.isArray(body?.serviceIds) ? body.serviceIds : [],
    );
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Patch('availability')
  updateAvailability(
    @Req() req,
    @Body()
    body: {
      blockedDates?: string[];
      workingHours?: { start?: string; end?: string };
    },
  ) {
    return this.vendorService.updateAvailability(req.user.uid, body ?? {});
  }

  // ================= BOOKINGS =================

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get('bookings')
  findVendorBookings(@Req() req) {
    return this.vendorService.getVendorBookings(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Patch('bookings/:id/status')
  updateBookingStatus(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.vendorService.updateVendorBookingStatus(
      req.user.uid,
      id,
      body.status,
    );
  }

  // ================= REVIEWS =================

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get('reviews')
  getReviews(@Req() req) {
    return this.vendorService.getVendorReviews(req.user.uid);
  }

  // ================= NOTIFICATIONS =================

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get('notifications')
  getNotifications(@Req() req) {
    return this.vendorService.getVendorNotifications(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Patch('notifications/:id/read')
  markNotificationRead(@Req() req, @Param('id') id: string) {
    return this.vendorService.markVendorNotificationRead(req.user.uid, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOneOrThrow(id);
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
