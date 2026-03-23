import { Model } from 'mongoose';
import { Request, RequestDocument } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BookingService } from '../booking/booking.service';
import { UserService } from '../user/user.service';
import { VendorService } from '../vendor/vendor.service';
import { EventService } from '../event/event.service';
export declare class RequestService {
    private requestModel;
    private bookingService;
    private userService;
    private vendorService;
    private eventService;
    constructor(requestModel: Model<RequestDocument>, bookingService: BookingService, userService: UserService, vendorService: VendorService, eventService: EventService);
    create(createRequestDto: CreateRequestDto): Promise<RequestDocument>;
    findAll(): Promise<RequestDocument[]>;
    findByUser(userId: string): Promise<RequestDocument[]>;
    findByVendor(vendorId: string): Promise<RequestDocument[]>;
    findByVendorUser(userId: string): Promise<any[]>;
    findByEvent(eventId: string): Promise<RequestDocument[]>;
    findOne(id: string): Promise<RequestDocument>;
    update(id: string, updateRequestDto: UpdateRequestDto): Promise<RequestDocument | (import("mongoose").Document<unknown, {}, RequestDocument, {}, {}> & Request & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | {
        request: RequestDocument;
        booking: (import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, RequestDocument, {}, {}> & Request & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private validateVendorActor;
    accept(id: string, actorUserId?: string): Promise<{
        request: RequestDocument;
        booking: (import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    reject(id: string, actorUserId?: string): Promise<RequestDocument>;
}
