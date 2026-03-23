import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    private sanitize;
    create(dto: CreateUserDto): Promise<any>;
    findAll(limit?: number, offset?: number, filters?: Record<string, any>): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByPhone(phone_number: string): Promise<(import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findByUserId(userId: string): Promise<any>;
    update(id: string, dto: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<any>;
}
