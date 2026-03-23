import { Document, Schema as MongooseSchema } from 'mongoose';
export type PayoutDocument = Payout & Document;
export declare class Payout {
    vendorId: MongooseSchema.Types.ObjectId;
    eventId: MongooseSchema.Types.ObjectId;
    totalEarned: number;
    commissionCut: number;
    payoutAmount: number;
    status: string;
}
export declare const PayoutSchema: MongooseSchema<Payout, import("mongoose").Model<Payout, any, any, any, Document<unknown, any, Payout, any, {}> & Payout & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payout, Document<unknown, {}, import("mongoose").FlatRecord<Payout>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Payout> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
