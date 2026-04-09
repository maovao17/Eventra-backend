import { VendorService } from '../vendor/vendor.service';
import { UserService } from '../user/user.service';
import { BookingService } from '../booking/booking.service';
import { PaymentService } from '../payment/payment.service';
import { EventService } from '../event/event.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CreateEventDto } from '../event/dto/create-event.dto';
import { UpdateEventDto } from '../event/dto/update-event.dto';
export declare class AdminController {
    private readonly vendorService;
    private readonly userService;
    private readonly bookingService;
    private readonly paymentService;
    private readonly eventService;
    constructor(vendorService: VendorService, userService: UserService, bookingService: BookingService, paymentService: PaymentService, eventService: EventService);
    getUsers(): Promise<import("../user/schemas/user.schema").UserDocument[]>;
    getVendors(): Promise<import("../vendor/schemas/vendor.schema").Vendor[]>;
    approveVendor(id: string): Promise<import("../vendor/schemas/vendor.schema").Vendor>;
    rejectVendor(id: string): Promise<import("../vendor/schemas/vendor.schema").Vendor>;
    getBookings(): Promise<(import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getPayments(): Promise<import("../payment/schemas/payment.schema").Payment[]>;
    updateUser(id: string, dto: UpdateUserDto): Promise<import("../user/schemas/user.schema").UserDocument>;
    removeUser(id: string): Promise<import("../user/schemas/user.schema").UserDocument>;
    getEvents(): Promise<(import("mongoose").Document<unknown, {}, import("../event/schemas/event.schema").EventDocument, {}, {}> & import("../event/schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createEvent(dto: CreateEventDto): Promise<import("mongoose").Document<unknown, {}, import("../event/schemas/event.schema").EventDocument, {}, {}> & import("../event/schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateEvent(id: string, dto: UpdateEventDto): Promise<import("mongoose").Document<unknown, {}, import("../event/schemas/event.schema").EventDocument, {}, {}> & import("../event/schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    removeEvent(id: string): Promise<import("mongoose").Document<unknown, {}, import("../event/schemas/event.schema").EventDocument, {}, {}> & import("../event/schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
