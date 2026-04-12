import { Model } from 'mongoose';
import { Request, RequestDocument } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BookingService } from '../booking/booking.service';
import { UserService } from '../user/user.service';
import { VendorService } from '../vendor/vendor.service';
import { EventService } from '../event/event.service';
import { EventsGateway } from '../events/events.gateway';
import { EventDocument } from '../event/schemas/event.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
export declare class RequestService {
    private requestModel;
    private eventModel;
    private userModel;
    private bookingModel;
    private bookingService;
    private userService;
    private vendorService;
    private eventService;
    private eventsGateway;
    constructor(requestModel: Model<RequestDocument>, eventModel: Model<EventDocument>, userModel: Model<UserDocument>, bookingModel: Model<BookingDocument>, bookingService: BookingService, userService: UserService, vendorService: VendorService, eventService: EventService, eventsGateway: EventsGateway);
    create(createRequestDto: CreateRequestDto): Promise<RequestDocument>;
    findAll(): Promise<RequestDocument[]>;
    findByUser(userId: string): Promise<RequestDocument[]>;
    findByVendor(vendorId: string): Promise<RequestDocument[]>;
    findByVendorUser(userId: string): Promise<any[]>;
    findByEvent(eventId: string): Promise<RequestDocument[]>;
    findByQuery(filters: {
        customerId?: string;
        vendorId?: string;
        eventId?: string;
    }): Promise<RequestDocument[]>;
    findOne(id: string): Promise<RequestDocument>;
    update(id: string, updateRequestDto: UpdateRequestDto): Promise<import("mongoose").Document<unknown, {}, RequestDocument, {}, {}> & Request & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, RequestDocument, {}, {}> & Request & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private validateVendorActor;
    accept(id: string, actorUserIdFromToken: string): Promise<{
        request: RequestDocument;
        booking: (import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    reject(id: string, actorUserIdFromToken: string): Promise<RequestDocument>;
}
