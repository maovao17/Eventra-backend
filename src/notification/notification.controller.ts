import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('vendorId') vendorId?: string) {
    if (userId) return this.notificationService.findByUser(userId);
    if (vendorId) return this.notificationService.findByVendor(vendorId);
    return this.notificationService.findAll();
  }

  @Post('run-reminders')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  runReminders() {
    return this.notificationService.generateEventReminders();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: any) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
