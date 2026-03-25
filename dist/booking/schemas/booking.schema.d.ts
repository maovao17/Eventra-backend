import { Document } from 'mongoose';
export type BookingDocument = Booking & Document;
export declare class Booking {
    requestId: string;
    customerId: string;
    vendorId: string;
    eventId: string;
    amount: number;
    price?: number;
    date?: string;
    time?: string;
    location?: string;
    eventType?: string;
    guests?: number;
    status: string;
    paymentStatus?: string;
    eventDetails?: {
        type?: string;
        date?: string;
        time?: string;
        location?: string;
        guests?: number;
    };
    completionImages?: string[];
    payoutStatus?: string;
}
export declare const BookingSchema: import("mongoose").Schema<Booking, import("mongoose").Model<Booking, any, any, any, Document<unknown, any, Booking, any, {}> & Booking & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Booking, Document<unknown, {}, import("mongoose").FlatRecord<Booking>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Booking> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
