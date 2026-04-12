import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AuthenticatedUser } from '../types/auth.types';
import { VendorService } from './vendor.service';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { CloudinaryService } from './cloudinary.service';
export declare class VendorController {
    readonly vendorService: VendorService;
    private readonly userService;
    private readonly notificationService;
    private readonly cloudinaryService;
    constructor(vendorService: VendorService, userService: UserService, notificationService: NotificationService, cloudinaryService: CloudinaryService);
    getMe(req: {
        user: AuthenticatedUser;
    }): Promise<any>;
    updateProfile(req: {
        user: AuthenticatedUser;
    }, body: UpdateVendorDto): Promise<import("./schemas/vendor.schema").Vendor>;
    findAll(): Promise<import("./schemas/vendor.schema").Vendor[]>;
    findApproved(): Promise<import("./schemas/vendor.schema").Vendor[]>;
    uploadFile(file: Express.Multer.File): Promise<{
        fullUrl: string;
        url: string;
    }>;
    uploadMultiple(files: Express.Multer.File[]): Promise<{
        data: {
            url: string;
        }[];
    }>;
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
    getNotifications(req: {
        user: AuthenticatedUser;
    }): Promise<import("../notification/schemas/notification.schema").Notification[]>;
    findOne(id: string): Promise<import("./schemas/vendor.schema").Vendor | null>;
    approveVendor(id: string): Promise<import("./schemas/vendor.schema").Vendor>;
    reject(id: string): Promise<import("./schemas/vendor.schema").Vendor>;
    updateServices(req: {
        user: AuthenticatedUser;
    }, body: {
        servicesOffered: string[];
    }): Promise<import("./schemas/vendor.schema").Vendor>;
    updateAvailability(req: {
        user: AuthenticatedUser;
    }, body: {
        blockedDates: string[];
    }): Promise<import("./schemas/vendor.schema").Vendor>;
}
