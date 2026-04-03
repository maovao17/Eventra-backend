import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BookingDocument } from '../booking/schemas/booking.schema';
import { EventsGateway } from '../events/events.gateway';
export declare class NotificationService implements OnModuleInit {
    private notificationModel;
    private bookingModel;
    private eventsGateway;
    constructor(notificationModel: Model<NotificationDocument>, bookingModel: Model<BookingDocument>, eventsGateway: EventsGateway);
    onModuleInit(): void;
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    generateEventReminders(): Promise<void>;
    findAll(): Promise<Notification[]>;
    findByUser(userId: string): Promise<Notification[]>;
    findByVendor(vendorId: string): Promise<Notification[]>;
    findOne(id: string): Promise<Notification>;
    markAsRead(id: string): Promise<Notification>;
    update(id: string, updateNotificationDto: any): Promise<Notification>;
    remove(id: string): Promise<Notification>;
}
