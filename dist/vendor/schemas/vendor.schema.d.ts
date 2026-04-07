import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type VendorDocument = Vendor & Document;
export declare class VendorPackage {
    name: string;
    price: number;
    description?: string;
    servicesIncluded?: string[];
}
export declare class VendorServiceItem {
    name: string;
    price?: number;
    description?: string;
}
export declare class VendorPortfolioItem {
    url: string;
    caption?: string;
    category?: string;
    uploadedAt: Date;
}
export declare class VendorWorkingHours {
    start?: string;
    end?: string;
}
export declare class VendorAvailability {
    blockedDates?: Date[];
    workingHours?: VendorWorkingHours;
}
export declare class VendorLocation {
    city?: string;
    area?: string;
    address?: string;
}
export declare class VendorBankDetails {
    accountHolder?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
}
export declare class Vendor {
    userId?: string;
    _id: Types.ObjectId;
    name: string;
    email?: string;
    phone?: string;
    businessType?: string;
    description?: string;
    category?: string[];
    servicesOffered?: Types.ObjectId[];
    location?: VendorLocation;
    portfolio?: VendorPortfolioItem[];
    availability?: VendorAvailability;
    kycDocs?: string[];
    isVerified?: boolean;
    rating?: number;
    totalReviews?: number;
    price?: number;
    image?: string;
    responseTime?: string;
    businessName?: string;
    experience?: string;
    profileImage?: string;
    coverImage?: string;
    services?: VendorServiceItem[];
    packages?: VendorPackage[];
    gallery?: string[];
    reviews?: any[];
    verified?: boolean;
    status: string;
    bankDetails?: VendorBankDetails;
}
export declare const VendorSchema: MongooseSchema<Vendor, import("mongoose").Model<Vendor, any, any, any, Document<unknown, any, Vendor, any, {}> & Vendor & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vendor, Document<unknown, {}, import("mongoose").FlatRecord<Vendor>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Vendor> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
