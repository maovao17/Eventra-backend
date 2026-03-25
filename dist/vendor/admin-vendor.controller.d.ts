import { VendorService } from './vendor.service';
export declare class AdminVendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    getPendingVendors(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/vendor.schema").VendorDocument, {}, {}> & import("./schemas/vendor.schema").Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    approveVendor(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/vendor.schema").VendorDocument, {}, {}> & import("./schemas/vendor.schema").Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    verifyVendor(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/vendor.schema").VendorDocument, {}, {}> & import("./schemas/vendor.schema").Vendor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
