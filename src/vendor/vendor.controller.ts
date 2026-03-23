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

  

  @Post()
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.create(createVendorDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return this.vendorService.getByUserId(req.user.id);
  }

@UseGuards(FirebaseAuthGuard)
  @Patch('me')
  updateMe(@Req() req, @Body() dto: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.id, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('profile')
  updateProfilePatch(@Req() req, @Body() payload?: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.id, payload ?? {});
  }

  @Put('profile')
  updateProfile(@Req() req, @Body() payload: UpdateVendorDto) {
    return this.vendorService.updateByUserId(req.user.id, payload);
  }

@UseGuards(FirebaseAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    this.validateImageFile(file);

    const fullUrl = await this.saveUpload(file, req);
    const relativePath = new URL(fullUrl).pathname;

    return {
      url: relativePath,
      fullUrl,
    };
  }

  @Get('by-services')
  getByServices(@Query('services') services: string) {
    const serviceArray = services.split(',');
    return this.vendorService.findByServices(serviceArray);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 7))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[], @Req() req) {
    if (!files?.length) {
      throw new BadRequestException('At least one file is required');
    }

    if (files.length > 7) {
      throw new BadRequestException('Maximum 7 images are allowed');
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        this.validateImageFile(file);
        const fullUrl = await this.saveUpload(file, req);
        return {
          url: new URL(fullUrl).pathname,
          fullUrl,
        };
      }),
    );

    return uploads;
  }

@UseGuards(FirebaseAuthGuard)
  @Post('portfolio')
  @UseInterceptors(FilesInterceptor('files', 7))
  async uploadPortfolio(
    @UploadedFiles() files: any[],
    @Body() body: { caption?: string; category?: string },
    @Req() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }
    if (files.length > 7) {
      throw new BadRequestException('Maximum 7 images are allowed');
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        this.validateImageFile(file);
        return this.saveUpload(file, req);
      }),
    );

    return this.vendorService.addPortfolioItems(
      req.user.id,
      urls.map((url) => ({
        url,
        caption: body.caption ?? '',
        category: body.category ?? '',
        uploadedAt: new Date(),
      })),
    );
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('services')
  assignServices(@Req() req, @Body() body: { serviceIds?: string[] }) {
    return this.vendorService.assignServices(req.user.id, body.serviceIds ?? []);
  }

@UseGuards(FirebaseAuthGuard)
  @Patch('availability')
  updateAvailability(
    @Req() req,
    @Body()
    body: {
      blockedDates?: string[];
      workingHours?: { start?: string; end?: string };
    },
  ) {
    return this.vendorService.updateAvailability(req.user.id, {
      blockedDates: body.blockedDates,
      workingHours: body.workingHours,
    });
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('packages')
  addPackage(
    @Req() req,
    @Body()
    body: {
      name?: string;
      price?: number;
      description?: string;
      servicesIncluded?: string[];
    },
  ) {
    if (!body.name || body.price === undefined) {
      throw new BadRequestException('name and price are required');
    }

    return this.vendorService.addPackage(req.user.id, {
      name: body.name,
      price: body.price,
      description: body.description,
      servicesIncluded: body.servicesIncluded ?? [],
    });
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('upload-profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    this.validateImageFile(file);
    const imageUrl = await this.saveUpload(file, req);
    return this.vendorService.updateProfileImage(req.user.id, imageUrl);
  }

@UseGuards(FirebaseAuthGuard)
  @Post('upload-gallery')
  @UseInterceptors(FileInterceptor('file'))
  async uploadGalleryImage(
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    this.validateImageFile(file);
    const imageUrl = await this.saveUpload(file, req);
    return this.vendorService.addGalleryImage(req.user.id, imageUrl);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('bookings')
  findVendorBookings(@Req() req, @Query('bucket') bucket?: string) {
    return this.vendorService.getVendorBookings(req.user.id, bucket);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('bookings/:id/status')
  updateBookingStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { status?: 'pending' | 'accepted' | 'completed' | 'cancelled' },
  ) {
    if (!body.status) {
      throw new BadRequestException('status is required');
    }

    return this.vendorService.updateVendorBookingStatus(req.user.id, id, body.status);
  }

  @Get('reviews')
  getReviews(@Req() req) {
    return this.vendorService.getVendorReviews(req.user.id);
  }

  @Get('notifications')
  getNotifications(@Req() req) {
    return this.vendorService.getVendorNotifications(req.user.id);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(@Req() req, @Param('id') id: string) {
    return this.vendorService.markVendorNotificationRead(req.user.id, id);
  }

  @Get('dashboard')
async getDashboard(@Req() req) {
  const data = await this.vendorService.getDashboard(req.user.id);

  return data || {
    totalBookings: 0,
    pendingRequests: 0,
    revenue: 0,
    averageRating: 0,
  };
}

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.vendorService.findByUserId(userId);
    }

    return this.vendorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorService.update(id, updateVendorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(id);
  }

  private async saveUpload(file: any, req: any) {
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.originalname.includes('.')
      ? `.${file.originalname.split('.').pop()}`
      : '';
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = join(uploadsDir, fileName);

    if (file.buffer) {
      await writeFile(filePath, file.buffer);
    } else if ((file as any).path) {
      // Multer disk storage fallback
      return `${req.protocol ?? 'http'}://${req.get?.('host') ?? 'localhost:3002'}/uploads/${file.filename}`;
    } else {
      throw new BadRequestException('Invalid file payload');
    }

    const origin = `${req.protocol ?? 'http'}://${req.get?.('host') ?? 'localhost:3002'}`;
    return `${origin}/uploads/${fileName}`;
  }

  private validateImageFile(file: Express.Multer.File) {
    if (!VendorController.ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only jpg, jpeg, and png files are allowed');
    }
  }
}
