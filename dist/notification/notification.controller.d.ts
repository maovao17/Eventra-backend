import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("./schemas/notification.schema").Notification>;
    findAll(userId?: string, vendorId?: string): Promise<import("./schemas/notification.schema").Notification[]>;
    runReminders(): Promise<void>;
    findOne(id: string): Promise<import("./schemas/notification.schema").Notification>;
    markAsRead(id: string): Promise<import("./schemas/notification.schema").Notification>;
    update(id: string, updateNotificationDto: any): Promise<import("./schemas/notification.schema").Notification>;
    remove(id: string): Promise<import("./schemas/notification.schema").Notification>;
}
