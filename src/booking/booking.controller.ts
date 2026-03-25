import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('customerId') customerId?: string, @Query('vendorId') vendorId?: string) {
    const effectiveCustomerId = customerId ?? userId;
    if (effectiveCustomerId) return this.bookingService.findByUser(effectiveCustomerId);
    if (vendorId) return this.bookingService.findByVendor(vendorId);
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Body('actorUserId') actorUserId?: string) {
    return this.bookingService.accept(id, actorUserId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('actorUserId') actorUserId?: string) {
    return this.bookingService.reject(id, actorUserId);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Body('actorUserId') actorUserId?: string) {
    return this.bookingService.complete(id, actorUserId);
  }

  @Post(':id/upload-proof')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body('actorUserId') actorUserId?: string,
    @Req() req?: any,
  ) {
    if (!file) throw new BadRequestException('file is required');
    const imageUrl = await this.saveUpload(file, req);
    return this.bookingService.uploadCompletionProof(id, imageUrl, actorUserId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.update(id, dto);
  }

  @Patch(':id/payout')
  async markPayoutPaid(@Param('id') id: string) {
    return this.bookingService.markPayoutPaid(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
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

    const origin = `${req?.protocol ?? 'http'}://${req?.get?.('host') ?? 'localhost:3002'}`;
    return `${origin}/uploads/${fileName}`;
  }
}
