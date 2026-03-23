import { Model, Types } from 'mongoose';
import { VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { BookingDocument } from '../booking/schemas/booking.schema';
import { RequestDocument } from '../request/schemas/request.schema';
import { ServiceDocument } from '../service/schemas/service.schema';
import { Review, ReviewDocument } from '../review/schemas/review.schema';
import { Notification, NotificationDocument } from '../notification/schemas/notification.schema';
import { UserService } from '../user/user.service';
declare const BOOKING_STATUS: readonly ["pending", "accepted", "completed", "cancelled"];
type BookingStatus = (typeof BOOKING_STATUS)[number];
type VendorPackageInput = {
    name: string;
    price: number;
    description?: string;
    servicesIncluded?: string[];
};
type VendorPortfolioInput = {
    url: string;
    caption?: string;
    category?: string;
    uploadedAt?: Date;
};
export declare class VendorService {
    private readonly vendorModel;
    private readonly bookingModel;
    private readonly requestModel;
    private readonly serviceModel;
    private readonly reviewModel;
    private readonly notificationModel;
    private readonly userService;
    constructor(vendorModel: Model<VendorDocument>, bookingModel: Model<BookingDocument>, requestModel: Model<RequestDocument>, serviceModel: Model<ServiceDocument>, reviewModel: Model<ReviewDocument>, notificationModel: Model<NotificationDocument>, userService: UserService);
    private sanitizeCategory;
    private normalizeLocation;
    private isProfileComplete;
    private mapBookingForVendor;
    create(createVendorDto: CreateVendorDto): Promise<VendorDocument>;
    getOrCreateVendorProfile(userId: string): Promise<VendorDocument>;
    getVendorMe(userId: string): Promise<any>;
    getByUserId(userId: string): Promise<any>;
    updateVendorMe(userId: string, updateVendorDto: UpdateVendorDto): Promise<any>;
    updateByUserId(userId: string, updateVendorDto: UpdateVendorDto): Promise<any>;
    upsertProfile(userId: string, updateVendorDto: UpdateVendorDto): Promise<VendorDocument>;
    addPortfolioItems(userId: string, items: VendorPortfolioInput[]): Promise<VendorDocument>;
    assignServices(userId: string, serviceIds: string[]): Promise<VendorDocument>;
    updateAvailability(userId: string, payload: {
        blockedDates?: string[];
        workingHours?: {
            start?: string;
            end?: string;
        };
    }): Promise<VendorDocument>;
    addPackage(userId: string, vendorPackage: VendorPackageInput): Promise<VendorDocument>;
    addGalleryImage(userId: string, imageUrl: string): Promise<VendorDocument>;
    updateProfileImage(userId: string, imageUrl: string): Promise<VendorDocument>;
    getVendorBookings(userId: string, bucket?: string): Promise<{
        _id: string;
        vendorId: string;
        userId: string;
        customerId: string;
        eventId: string;
        eventDetails: {
            type: string;
            date: string;
            time: string;
            location: string;
            guests: number;
        };
        status: string;
        paymentStatus: any;
        amount: number;
        requestId: string;
        createdAt: any;
    }[]>;
    updateVendorBookingStatus(userId: string, bookingId: string, status: BookingStatus): Promise<{
        _id: string;
        vendorId: string;
        userId: string;
        customerId: string;
        eventId: string;
        eventDetails: {
            type: string;
            date: string;
            time: string;
            location: string;
            guests: number;
        };
        status: string;
        paymentStatus: any;
        amount: number;
        requestId: string;
        createdAt: any;
    }>;
    getVendorReviews(userId: string): Promise<(import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getVendorNotifications(userId: string): Promise<(import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    markVendorNotificationRead(userId: string, notificationId: string): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDashboard(userId: string): Promise<{
        totalBookings: number;
        pendingRequests: number;
        pendingBookings: number;
        completedBookings: number;
        monthlyRevenue: number;
        monthlyEarnings: number;
        revenue: number;
        rating: number;
        totalReviews: number;
        upcomingEvents: number;
        verified: boolean;
        profileCompleted: boolean;
    }>;
    getPendingVendors(): Promise<VendorDocument[]>;
    approveVendor(id: string): Promise<VendorDocument>;
    findAll(): Promise<VendorDocument[]>;
    findByUserId(userId: string): Promise<VendorDocument | null>;
    findByUserIdOrThrow(userId: string): Promise<VendorDocument>;
    findByServices(services: string[]): Promise<VendorDocument[]>;
    findOne(id: string): Promise<VendorDocument>;
    update(id: string, updateVendorDto: UpdateVendorDto): Promise<VendorDocument>;
    remove(id: string): Promise<void>;
}
export {};
