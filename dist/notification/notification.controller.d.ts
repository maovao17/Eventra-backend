import { NotificationService } from './notification.service';
import { VendorService } from '../vendor/vendor.service';
export declare class NotificationController {
    private readonly notificationService;
    private readonly vendorService;
    constructor(notificationService: NotificationService, vendorService: VendorService);
    findAll(req: any, userId?: string, vendorId?: string): Promise<import("./schemas/notification.schema").Notification[]>;
    findOne(req: any, id: string): Promise<import("./schemas/notification.schema").Notification>;
    markAsRead(req: any, id: string): Promise<import("./schemas/notification.schema").Notification>;
    update(req: any, id: string, updateNotificationDto: any): Promise<import("./schemas/notification.schema").Notification>;
    remove(req: any, id: string): Promise<import("./schemas/notification.schema").Notification>;
}
