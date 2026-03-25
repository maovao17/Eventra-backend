import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    private static readonly ALLOWED_IMAGE_MIME_TYPES;
    create(dto: CreateVendorDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/vendor.schema").VendorDocument, {}, {}> & import("./schemas/vendor.schema").Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getMe(req: any): Promise<import("./schemas/vendor.schema").VendorDocument>;
    updateMe(req: any, dto: UpdateVendorDto): Promise<import("./schemas/vendor.schema").VendorDocument>;
    updateProfilePatch(req: any, payload?: UpdateVendorDto): Promise<import("./schemas/vendor.schema").VendorDocument>;
    updateProfile(req: any, payload: UpdateVendorDto): Promise<import("./schemas/vendor.schema").VendorDocument>;
    getDashboard(req: any): Promise<{
        totalBookings: number;
        pendingRequests: number;
        pendingBookings: number;
        completedBookings: number;
        revenue: number;
        monthlyRevenue: number;
        rating: number;
    }>;
    uploadFile(file: any, req: any): Promise<{
        url: string;
        fullUrl: string;
    }>;
    findVendorBookings(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateBookingStatus(req: any, id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getReviews(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../review/schemas/review.schema").ReviewDocument, {}, {}> & import("../review/schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getNotifications(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../notification/schemas/notification.schema").NotificationDocument, {}, {}> & import("../notification/schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    markNotificationRead(req: any, id: string): Promise<import("mongoose").Document<unknown, {}, import("../notification/schemas/notification.schema").NotificationDocument, {}, {}> & import("../notification/schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private saveUpload;
    private validateImageFile;
}
