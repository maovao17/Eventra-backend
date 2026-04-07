import { Document } from 'mongoose';
export type RequestDocument = Request & Document;
export declare class Request {
    customerId: string;
    vendorId: string;
    eventId: string;
    status: string;
}
export declare const RequestSchema: import("mongoose").Schema<Request, import("mongoose").Model<Request, any, any, any, Document<unknown, any, Request, any, {}> & Request & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Request, Document<unknown, {}, import("mongoose").FlatRecord<Request>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Request> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
