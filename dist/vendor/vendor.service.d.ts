import { Model } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { ReviewService } from '../review/review.service';
import { BookingService } from '../booking/booking.service';
import { NotificationService } from '../notification/notification.service';
export declare class VendorService {
    private vendorModel;
    private reviewService;
    private bookingService;
    private notificationService;
    constructor(vendorModel: Model<VendorDocument>, reviewService: ReviewService, bookingService: BookingService, notificationService: NotificationService);
    findByUserId(userId: string): Promise<any | null>;
    updateProfile(userId: string, data: UpdateVendorDto): Promise<Vendor>;
    findAllCompleted(): Promise<Vendor[]>;
    approveVendor(id: string): Promise<Vendor>;
    getAllVendors(): Promise<Vendor[]>;
    rejectVendor(id: string): Promise<Vendor>;
    findOne(id: string): Promise<Vendor | null>;
    findOneOrThrow(id: string): Promise<Vendor>;
    findByUserIdOrThrow(userId: string): Promise<Vendor>;
    update(id: string, data: any): Promise<any>;
    getVendorReviews(uid: string): Promise<(import("mongoose").Document<unknown, {}, import("../review/schemas/review.schema").ReviewDocument, {}, {}> & import("../review/schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getVendorBookings(uid: string): Promise<(import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getVendorNotifications(uid: string): Promise<import("../notification/schemas/notification.schema").Notification[]>;
}
