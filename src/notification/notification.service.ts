import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  onModuleInit() {
    void this.generateEventReminders();
    const interval = setInterval(() => {
      void this.generateEventReminders();
    }, 12 * 60 * 60 * 1000);
    interval.unref();
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const createdNotification = new this.notificationModel({
      ...createNotificationDto,
      read: false,
      createdAt: new Date(),
    });
    return createdNotification.save();
  }

  async generateEventReminders() {
    const bookings = await this.bookingModel
      .find({
        status: { $in: ['accepted', 'confirmed'] },
      })
      .exec();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const booking of bookings) {
      if (!booking.date) continue;

      const eventDate = new Date(booking.date);
      eventDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays !== 1 && diffDays !== 3) continue;

      const existing = await this.notificationModel.findOne({
        bookingId: String(booking._id),
        type: 'event-reminder',
        daysBefore: diffDays,
      });

      if (existing) continue;

      await this.create({
        userId: booking.customerId,
        vendorId: booking.vendorId,
        bookingId: String(booking._id),
        type: 'event-reminder',
        daysBefore: diffDays,
        message: `Reminder: Event is in ${diffDays} day${diffDays === 1 ? '' : 's'}.`,
      });
    }
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findByVendor(vendorId: string): Promise<Notification[]> {
    return this.notificationModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const updated = await this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true }).exec();
    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async update(id: string, updateNotificationDto: any): Promise<Notification> {
    const updated = await this.notificationModel.findByIdAndUpdate(id, updateNotificationDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }

  async remove(id: string): Promise<Notification> {
    const deleted = await this.notificationModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Notification not found');
    return deleted;
  }
}
