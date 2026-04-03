import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { VendorService } from '../vendor/vendor.service';
type AuthenticatedUser = {
    uid: string;
    role: 'customer' | 'vendor' | 'admin';
};
export declare class RequestController {
    private readonly requestService;
    private readonly vendorService;
    constructor(requestService: RequestService, vendorService: VendorService);
    create(req: {
        user: AuthenticatedUser;
    }, createRequestDto: CreateRequestDto): Promise<import("./schemas/request.schema").RequestDocument>;
    findForVendor(req: {
        user: AuthenticatedUser;
    }): Promise<any[]>;
    findAll(req: {
        user: AuthenticatedUser;
    }, eventId?: string, userId?: string, vendorId?: string): Promise<any[]>;
    findOne(req: any, id: string): Promise<import("./schemas/request.schema").RequestDocument>;
    accept(req: any, id: string): Promise<{
        request: import("./schemas/request.schema").RequestDocument;
        booking: (import("mongoose").Document<unknown, {}, import("../booking/schemas/booking.schema").BookingDocument, {}, {}> & import("../booking/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    reject(req: any, id: string): Promise<import("./schemas/request.schema").RequestDocument>;
}
export {};
