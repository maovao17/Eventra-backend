import { VendorService } from '../vendor/vendor.service';
import { UserService } from '../user/user.service';
import { BookingService } from '../booking/booking.service';
import { PaymentService } from '../payment/payment.service';
export declare class AdminController {
    private readonly vendorService;
    private readonly userService;
    private readonly bookingService;
    private readonly paymentService;
    constructor(vendorService: VendorService, userService: UserService, bookingService: BookingService, paymentService: PaymentService);
    getUsers(): Promise<any[]>;
    getVendors(): Promise<(import("mongoose").Document<unknown, {}, import("../vendor/schemas/vendor.schema").VendorDocument, {}, {}> & import("../vendor/schemas/vendor.schema").Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    approveVendor(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../vendor/schemas/vendor.schema").VendorDocument, {}, {}> & import("../vendor/schemas/vendor.schema").Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    rejectVendor(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../vendor/schemas/vendor.schema").VendorDocument, {}, {}> & import("../vendor/schemas/vendor.schema").Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getBookings(): Promise<(import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getPayments(): Promise<import("../payment/schemas/payment.schema").Payment[]>;
}
