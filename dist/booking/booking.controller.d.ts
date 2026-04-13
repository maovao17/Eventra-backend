import { BookingService } from './booking.service';
import { UpdateBookingDto } from './dto/update-booking.dto';
type AuthUser = {
    uid: string;
    role: 'customer' | 'vendor' | 'admin';
};
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    findAll(req: {
        user: AuthUser;
    }, userId?: string, customerId?: string, vendorId?: string, requestId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[] | (import("mongoose").FlattenMaps<import("./schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByRequestId(req: {
        user: AuthUser;
    }, requestId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findOne(req: {
        user: AuthUser;
    }, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    accept(req: {
        user: AuthUser;
    }, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    reject(req: {
        user: AuthUser;
    }, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    complete(req: any, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    uploadProof(id: string, file: any, req?: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus(req: any, id: string, dto: Pick<UpdateBookingDto, 'status'>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateBookingDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    markPayoutPaid(req: any, id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(req: any, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private saveUpload;
}
export {};
