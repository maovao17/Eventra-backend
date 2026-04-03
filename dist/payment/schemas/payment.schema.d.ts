import { Document } from 'mongoose';
export type PaymentDocument = Payment & Document;
export declare class Payment {
    bookingId: string;
    eventId?: string;
    vendorId?: string;
    customerId: string;
    requestId: string;
    amount: number;
    bookingAmount?: number;
    platformFee?: number;
    commissionAmount?: number;
    vendorPayoutAmount?: number;
    payoutId?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    status: string;
}
export declare const PaymentSchema: import("mongoose").Schema<Payment, import("mongoose").Model<Payment, any, any, any, Document<unknown, any, Payment, any, {}> & Payment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, import("mongoose").FlatRecord<Payment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Payment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
