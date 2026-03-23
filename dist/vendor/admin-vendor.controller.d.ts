import { VendorService } from './vendor.service';
export declare class AdminVendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    getPendingVendors(): Promise<import("./schemas/vendor.schema").VendorDocument[]>;
    approveVendor(id: string): Promise<import("./schemas/vendor.schema").VendorDocument>;
    verifyVendor(id: string): Promise<import("./schemas/vendor.schema").VendorDocument>;
}
