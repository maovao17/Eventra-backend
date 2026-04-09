import { HydratedDocument } from 'mongoose';
export type VendorDocument = HydratedDocument<Vendor>;
export declare class Vendor {
    userId: string;
    businessName?: string;
    description?: string;
    category?: string[];
    location?: any;
    experience?: string;
    profileImage?: string;
    portfolio?: Array<{
        url: string;
        caption: string;
    }>;
    profileCompleted: boolean;
    packages?: any[];
}
export declare const VendorSchema: import("mongoose").Schema<Vendor, import("mongoose").Model<Vendor, any, any, any, import("mongoose").Document<unknown, any, Vendor, any, {}> & Vendor & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vendor, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Vendor>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Vendor> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
