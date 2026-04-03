import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VendorDocument } from '../vendor/schemas/vendor.schema';
import { BookingDocument } from '../booking/schemas/booking.schema';
import { RequestDocument } from '../request/schemas/request.schema';
export declare class UserService {
    private userModel;
    private vendorModel;
    private bookingModel;
    private requestModel;
    constructor(userModel: Model<UserDocument>, vendorModel: Model<VendorDocument>, bookingModel: Model<BookingDocument>, requestModel: Model<RequestDocument>);
    private getAdminEmail;
    private isAdminEmail;
    private resolvePersistedRole;
    private sanitize;
    create(dto: CreateUserDto): Promise<UserDocument>;
    findAll(limit?: number, offset?: number, filters?: Record<string, unknown>): Promise<UserDocument[]>;
    findById(id: string): Promise<UserDocument>;
    findByPhone(phone_number: string): Promise<(import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findByUserId(userId: string): Promise<UserDocument>;
    assertVendorCanAccessUser(vendorUserId: string, targetUserId: string): Promise<UserDocument>;
    update(id: string, dto: UpdateUserDto): Promise<UserDocument>;
    remove(id: string): Promise<UserDocument>;
}
