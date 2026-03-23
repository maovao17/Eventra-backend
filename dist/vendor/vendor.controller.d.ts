import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    private static readonly ALLOWED_IMAGE_MIME_TYPES;
    create(createVendorDto: CreateVendorDto): Promise<import("./schemas/vendor.schema").VendorDocument>;
    getMe(req: any): Promise<any>;
    updateMe(req: any, dto: UpdateVendorDto): Promise<any>;
    updateProfilePatch(req: any, payload?: UpdateVendorDto): Promise<any>;
    updateProfile(req: any, payload: UpdateVendorDto): Promise<any>;
    uploadFile(file: Express.Multer.File, req: any): Promise<{
        url: string;
        fullUrl: string;
    }>;
    getByServices(services: string): Promise<import("./schemas/vendor.schema").VendorDocument[]>;
    uploadMultiple(files: Express.Multer.File[], req: any): Promise<{
        url: string;
        fullUrl: string;
    }[]>;
    uploadPortfolio(files: any[], body: {
        caption?: string;
        category?: string;
    }, req: any): Promise<import("./schemas/vendor.schema").VendorDocument>;
    assignServices(req: any, body: {
        serviceIds?: string[];
    }): Promise<import("./schemas/vendor.schema").VendorDocument>;
    updateAvailability(req: any, body: {
        blockedDates?: string[];
        workingHours?: {
            start?: string;
            end?: string;
        };
    }): Promise<import("./schemas/vendor.schema").VendorDocument>;
    addPackage(req: any, body: {
        name?: string;
        price?: number;
        description?: string;
        servicesIncluded?: string[];
    }): Promise<import("./schemas/vendor.schema").VendorDocument>;
    uploadProfileImage(file: any, req: any): Promise<import("./schemas/vendor.schema").VendorDocument>;
    uploadGalleryImage(file: any, req: any): Promise<import("./schemas/vendor.schema").VendorDocument>;
    findVendorBookings(req: any, bucket?: string): Promise<{
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
    updateBookingStatus(req: any, id: string, body: {
        status?: 'pending' | 'accepted' | 'completed' | 'cancelled';
    }): Promise<{
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
    getDashboard(req: any): Promise<{
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
    findAll(userId?: string): Promise<import("./schemas/vendor.schema").VendorDocument | null> | Promise<import("./schemas/vendor.schema").VendorDocument[]>;
    findOne(id: string): Promise<import("./schemas/vendor.schema").VendorDocument>;
    update(id: string, updateVendorDto: UpdateVendorDto): Promise<import("./schemas/vendor.schema").VendorDocument>;
    remove(id: string): Promise<void>;
    private saveUpload;
    private validateImageFile;
}
