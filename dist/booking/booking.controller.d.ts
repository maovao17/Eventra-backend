import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    create(dto: CreateBookingDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(userId?: string, customerId?: string, vendorId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    accept(id: string, actorUserId?: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    reject(id: string, actorUserId?: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    complete(id: string, actorUserId?: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    uploadProof(id: string, file: any, actorUserId?: string, req?: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateBookingDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    markPayoutPaid(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private saveUpload;
}
