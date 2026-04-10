import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AuthenticatedUser } from '../types/auth.types';
import { VendorService } from './vendor.service';
import { NotificationService } from '../notification/notification.service';
export declare class VendorController {
    private readonly vendorService;
    private readonly notificationService;
    constructor(vendorService: VendorService, notificationService: NotificationService);
    getMe(req: {
        user: AuthenticatedUser;
    }): Promise<any>;
    updateProfile(req: {
        user: AuthenticatedUser;
    }, body: UpdateVendorDto): Promise<import("./schemas/vendor.schema").Vendor>;
    findAll(): Promise<import("./schemas/vendor.schema").Vendor[]>;
    findApproved(): Promise<import("./schemas/vendor.schema").Vendor[]>;
    findOne(id: string): Promise<import("./schemas/vendor.schema").Vendor | null>;
    uploadFile(file: any): {
        fullUrl: string;
        filename: any;
    };
    uploadMultiple(file: any): {
        data: {
            url: string;
        }[];
    };
    getReviews(req: {
        user: AuthenticatedUser;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../review/schemas/review.schema").ReviewDocument, {}, {}> & import("../review/schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getBookings(req: {
        user: AuthenticatedUser;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    approve(id: string): Promise<import("./schemas/vendor.schema").Vendor>;
    getNotifications(req: {
        user: AuthenticatedUser;
    }): Promise<import("../notification/schemas/notification.schema").Notification[]>;
}
