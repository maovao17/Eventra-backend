import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
export declare class RequestController {
    private readonly requestService;
    constructor(requestService: RequestService);
    create(createRequestDto: CreateRequestDto): Promise<import("./schemas/request.schema").RequestDocument>;
    findForVendor(req: any): Promise<any[]>;
    findAll(userId?: string, vendorId?: string, eventId?: string): Promise<import("./schemas/request.schema").RequestDocument[]>;
    findOne(id: string): Promise<import("./schemas/request.schema").RequestDocument>;
    update(id: string, updateRequestDto: UpdateRequestDto): Promise<import("./schemas/request.schema").RequestDocument | (import("mongoose").Document<unknown, {}, import("./schemas/request.schema").RequestDocument, {}, {}> & import("./schemas/request.schema").Request & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | {
        request: import("./schemas/request.schema").RequestDocument;
        booking: (import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/request.schema").RequestDocument, {}, {}> & import("./schemas/request.schema").Request & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    accept(id: string, actorUserId?: string): Promise<{
        request: import("./schemas/request.schema").RequestDocument;
        booking: (import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    reject(id: string, actorUserId?: string): Promise<import("./schemas/request.schema").RequestDocument>;
}
