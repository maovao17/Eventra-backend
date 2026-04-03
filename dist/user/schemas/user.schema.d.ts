import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    phoneNumber?: string;
    name: string;
    email?: string;
    profile_photo?: string;
    userId: string;
    authProvider: 'phone' | 'google';
    role: string;
    businessName?: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
