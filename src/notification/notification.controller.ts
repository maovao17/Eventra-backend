import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { VendorService } from '../vendor/vendor.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly vendorService: VendorService,
  ) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get()
  async findAll(
    @Req() req,
    @Query('userId') userId?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    if (req.user.role === 'admin') {
      if (userId) return this.notificationService.findByUser(userId);
      if (vendorId) return this.notificationService.findByVendor(vendorId);
      return this.notificationService.findAll();
    }

    if (req.user.role === 'vendor') {
      try {
        const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
        return this.notificationService.findByVendor(String((vendor as any)._id));
      } catch {
        return [];
      }
    }

    return this.notificationService.findByUser(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const notification = await this.notificationService.findOne(id);

    if (req.user.role === 'admin') {
      return notification;
    }

    if (
      req.user.role === 'customer' &&
      String(notification.userId) === String(req.user.uid)
    ) {
      return notification;
    }

    if (req.user.role === 'vendor') {
      const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
      if (String(notification.vendorId) === String((vendor as any)._id)) {
        return notification;
      }
    }

    throw new ForbiddenException('You do not have access to this notification');
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Patch(':id/read')
  async markAsRead(@Req() req, @Param('id') id: string) {
    await this.findOne(req, id);
    return this.notificationService.markAsRead(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateNotificationDto: any,
  ) {
    await this.findOne(req, id);
    return this.notificationService.update(id, updateNotificationDto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    await this.findOne(req, id);
    return this.notificationService.remove(id);
  }
}
