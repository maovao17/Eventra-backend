import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type AuthUser = {
  uid: string;
  role: 'customer' | 'vendor' | 'admin';
};

const VENDOR_ALLOWED_STATUSES = new Set(['accepted', 'rejected', 'completed']);

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get()
  async findAll(
    @Req() req: { user: AuthUser },
    @Query('userId') userId?: string,
    @Query('customerId') customerId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('requestId') requestId?: string,
  ) {
    if (requestId) {
      const booking = await this.bookingService.findByRequestId(requestId);
      if (!booking) return [];

      if (req.user.role === 'admin') {
        return [booking];
      }

      if (req.user.role === 'customer') {
        if (String(booking.customerId) !== String(req.user.uid)) {
          throw new ForbiddenException(
            'You do not have access to this booking',
          );
        }
        return [booking];
      }

      // vendor
      await this.bookingService.assertVendorOwnership(
        String(booking._id),
        req.user.uid,
      );
      return [booking];
    }

    if (req.user.role === 'admin') {
      const effectiveCustomerId = customerId ?? userId;
      if (effectiveCustomerId)
        return this.bookingService.findByUser(effectiveCustomerId);
      if (vendorId) return this.bookingService.findByVendor(vendorId);
      return this.bookingService.findAll();
    }

    if (req.user.role === 'customer') {
      return this.bookingService.findByUser(req.user.uid);
    }

    return this.bookingService.findByVendorUser(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get('by-request/:requestId')
  async findByRequestId(
    @Req() req: { user: AuthUser },
    @Param('requestId') requestId: string,
  ) {
    const booking = await this.bookingService.findByRequestId(requestId);
    if (!booking) return null;

    if (req.user.role === 'admin') {
      return booking;
    }

    if (req.user.role === 'customer') {
      if (String(booking.customerId) !== String(req.user.uid)) {
        throw new ForbiddenException('You do not have access to this booking');
      }
      return booking;
    }

    // vendor
    await this.bookingService.assertVendorOwnership(
      String(booking._id),
      req.user.uid,
    );
    return booking;
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get(':id')
  async findOne(@Req() req: { user: AuthUser }, @Param('id') id: string) {
    const booking = await this.bookingService.findById(id);

    if (req.user.role === 'admin') {
      return booking;
    }

    if (
      req.user.role === 'customer' &&
      String(booking.customerId) === String(req.user.uid)
    ) {
      return booking;
    }

    if (req.user.role === 'vendor') {
      await this.bookingService.assertVendorOwnership(id, req.user.uid);
      return booking;
    }

    throw new ForbiddenException('You do not have access to this booking');
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Patch(':id/accept')
  accept(@Req() req: { user: AuthUser }, @Param('id') id: string) {
    return this.bookingService.accept(id, req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Patch(':id/reject')
  reject(@Req() req: { user: AuthUser }, @Param('id') id: string) {
    return this.bookingService.reject(id, req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Patch(':id/complete')
  complete(@Req() req, @Param('id') id: string) {
    return this.bookingService.complete(id, req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Post(':id/upload-proof')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error('Invalid file type. Only JPG/PNG/WEBP allowed.'),
            false,
          );
        }
      },
    }),
  )
  async uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Req() req?: any,
  ) {
    if (!file) throw new BadRequestException('file is required');
    const imageUrl = await this.saveUpload(file, req);
    return this.bookingService.uploadCompletionProof(
      id,
      imageUrl,
      req?.user?.uid,
    );
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Patch(':id/status')
  async updateStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: Pick<UpdateBookingDto, 'status'>,
  ) {
    if (!dto?.status) {
      throw new BadRequestException('status is required');
    }

    if (req.user.role === 'vendor') {
      if (!VENDOR_ALLOWED_STATUSES.has(dto.status)) {
        throw new BadRequestException(
          'Vendors can only set status to accepted, rejected, or completed',
        );
      }

      await this.bookingService.assertVendorOwnership(id, req.user.uid);

      if (dto.status === 'accepted') {
        return this.bookingService.accept(id, req.user.uid);
      }

      if (dto.status === 'rejected') {
        return this.bookingService.reject(id, req.user.uid);
      }

      return this.bookingService.complete(id, req.user.uid);
    }

    await this.bookingService.findById(id);
    return this.bookingService.update(id, { status: dto.status });
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    await this.bookingService.findById(id);
    return this.bookingService.update(id, dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/payout')
  async markPayoutPaid(@Req() req, @Param('id') id: string) {
    await this.bookingService.findById(id);
    return this.bookingService.markPayoutPaid(id, req.user.role);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    await this.bookingService.assertVendorOwnership(id, req.user.uid);
    return this.bookingService.remove(id);
  }

  private async saveUpload(file: any, req: any) {
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.originalname.includes('.')
      ? `.${file.originalname.split('.').pop()}`
      : '';
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    const host = req?.get?.('host') || process.env.CORS_ORIGIN || 'localhost:3000';
    const origin = `${req?.protocol ?? 'http'}://${host}`;
    return `${origin}/uploads/${fileName}`;
  }
}
