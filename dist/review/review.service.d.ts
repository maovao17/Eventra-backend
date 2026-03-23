import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingService } from '../booking/booking.service';
import { UserService } from '../user/user.service';
import { VendorService } from '../vendor/vendor.service';
export declare class ReviewService {
    private reviewModel;
    private bookingService;
    private userService;
    private vendorService;
    constructor(reviewModel: Model<ReviewDocument>, bookingService: BookingService, userService: UserService, vendorService: VendorService);
    create(dto: CreateReviewDto): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    reply(reviewId?: string, actorUserId?: string, reply?: string): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByVendor(vendorId: string): Promise<(import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByBooking(bookingId: string): Promise<(import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    private refreshVendorRating;
}
