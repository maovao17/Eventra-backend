import { Document, Schema as MongooseSchema } from 'mongoose';
export type ServiceDocument = Service & Document;
export declare class Service {
    name: string;
    category: string;
    price?: number;
    pricingModel?: string;
    description?: string;
    location?: Record<string, any>;
    image?: string;
    vendor_Id?: MongooseSchema.Types.ObjectId;
}
export declare const ServiceSchema: MongooseSchema<Service, import("mongoose").Model<Service, any, any, any, Document<unknown, any, Service, any, {}> & Service & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Service, Document<unknown, {}, import("mongoose").FlatRecord<Service>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Service> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
