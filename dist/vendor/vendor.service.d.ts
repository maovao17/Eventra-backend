import { Model } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
import { RequestDocument } from '../request/schemas/request.schema';
import { Review, ReviewDocument } from '../review/schemas/review.schema';
import { Notification, NotificationDocument } from '../notification/schemas/notification.schema';
import { UserService } from '../user/user.service';
export declare class VendorService {
    private readonly vendorModel;
    private readonly bookingModel;
    private readonly requestModel;
    private readonly reviewModel;
    private readonly notificationModel;
    private readonly userService;
    constructor(vendorModel: Model<VendorDocument>, bookingModel: Model<BookingDocument>, requestModel: Model<RequestDocument>, reviewModel: Model<ReviewDocument>, notificationModel: Model<NotificationDocument>, userService: UserService);
    create(dto: any): Promise<import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getOrCreateVendorProfile(userId: string): Promise<VendorDocument>;
    getByUserId(userId: string): Promise<VendorDocument>;
    updateByUserId(userId: string, dto: UpdateVendorDto): Promise<VendorDocument>;
    getDashboard(userId: string): Promise<{
        totalBookings: number;
        pendingRequests: number;
        pendingBookings: number;
        completedBookings: number;
        revenue: number;
        monthlyRevenue: number;
        rating: number;
    }>;
    private emptyDashboard;
    getVendorBookings(userId: string): Promise<(import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateVendorBookingStatus(userId: string, bookingId: string, status: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getVendorReviews(userId: string): Promise<(import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getVendorNotifications(userId: string): Promise<(import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    markVendorNotificationRead(userId: string, id: string): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findOne(id: string): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findByUserIdOrThrow(userId: string): Promise<import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findByUserId(userId: string): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    update(vendorId: string, data: any): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getPendingVendors(): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    approveVendor(id: string): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    rejectVendor(id: string): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getAllVendors(): Promise<(import("mongoose").Document<unknown, {}, VendorDocument, {}, {}> & Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
