import { Model } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { RequestDocument } from '../request/schemas/request.schema';
import { ReviewService } from '../review/review.service';
import { BookingService } from '../booking/booking.service';
import { NotificationService } from '../notification/notification.service';
export declare class VendorService {
    private vendorModel;
    private requestModel;
    private reviewService;
    private bookingService;
    private notificationService;
    constructor(vendorModel: Model<VendorDocument>, requestModel: Model<RequestDocument>, reviewService: ReviewService, bookingService: BookingService, notificationService: NotificationService);
    findByUserId(userId: string): Promise<any | null>;
    updateProfile(userId: string, data: UpdateVendorDto): Promise<Vendor>;
    addPackage(userId: string, pkg: {
        name: string;
        price: number;
        description?: string;
        servicesIncluded?: string[];
    }): Promise<Vendor>;
    removePackage(userId: string, packageId: string): Promise<Vendor>;
    findAllCompleted(): Promise<Vendor[]>;
    findByServices(services: string[]): Promise<Vendor[]>;
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
    getVendorBookings(uid: string): Promise<(import("mongoose").FlattenMaps<import("../booking/schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDashboardStats(userId: string): Promise<{
        totalBookings: number;
        revenue: number;
        pendingBookings: number;
        averageRating: number;
        recentBookings: {
            id: string;
            status: string;
            amount: number;
            createdAt: any;
            eventType: any;
        }[];
        monthlyRevenue: {
            month: string;
            revenue: number;
        }[];
        upcomingEvents: {
            id: string;
            eventType: any;
            date: any;
            location: any;
            guests: any;
            status: string;
            amount: number;
        }[];
    } | null>;
    getVendorNotifications(uid: string): Promise<import("../notification/schemas/notification.schema").Notification[]>;
}
