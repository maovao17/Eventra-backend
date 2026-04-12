import { HydratedDocument } from 'mongoose';
export type VendorDocument = HydratedDocument<Vendor>;
declare class Package {
    name: string;
    price: number;
    description?: string;
    servicesIncluded?: string[];
}
export declare const PackageSchema: import("mongoose").Schema<Package, import("mongoose").Model<Package, any, any, any, import("mongoose").Document<unknown, any, Package, any, {}> & Package & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Package, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Package>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Package> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
declare class Location {
    city?: string;
    area?: string;
    address?: string;
}
export declare const LocationSchema: import("mongoose").Schema<Location, import("mongoose").Model<Location, any, any, any, import("mongoose").Document<unknown, any, Location, any, {}> & Location & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Location, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Location>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Location> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Vendor {
    userId: string;
    businessName?: string;
    description?: string;
    category?: string[];
    location?: Location;
    experience?: string;
    profileImage?: string;
    portfolio?: Array<{
        url: string;
        caption: string;
    }>;
    profileCompleted: boolean;
    isApproved: boolean;
    packages?: Package[];
    status?: string;
    isVerified?: boolean;
}
export declare const VendorSchema: import("mongoose").Schema<Vendor, import("mongoose").Model<Vendor, any, any, any, import("mongoose").Document<unknown, any, Vendor, any, {}> & Vendor & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vendor, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Vendor>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Vendor> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
