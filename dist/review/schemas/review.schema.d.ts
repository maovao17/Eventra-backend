import { Document } from 'mongoose';
export type ReviewDocument = Review & Document;
export declare class Review {
    bookingId: string;
    customerId: string;
    userId?: string;
    vendorId: string;
    rating: number;
    comment: string;
    text?: string;
    images?: string[];
    reply?: string;
    replyBy?: string;
    repliedAt?: Date;
}
export declare const ReviewSchema: import("mongoose").Schema<Review, import("mongoose").Model<Review, any, any, any, Document<unknown, any, Review, any, {}> & Review & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Review, Document<unknown, {}, import("mongoose").FlatRecord<Review>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Review> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
