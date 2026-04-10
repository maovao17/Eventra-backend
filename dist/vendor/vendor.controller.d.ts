import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AuthenticatedUser } from '../types/auth.types';
import { VendorService } from './vendor.service';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    getMe(req: {
        user: AuthenticatedUser;
    }): Promise<import("./schemas/vendor.schema").Vendor | null>;
    updateProfile(req: {
        user: AuthenticatedUser;
    }, body: UpdateVendorDto): Promise<import("./schemas/vendor.schema").Vendor>;
    findAll(): Promise<import("./schemas/vendor.schema").Vendor[]>;
    findApproved(): Promise<import("./schemas/vendor.schema").Vendor[]>;
    uploadFile(file: any, req: {
        user: AuthenticatedUser;
    }): {
        fullUrl: string;
        filename: any;
    };
    approve(id: string): Promise<import("./schemas/vendor.schema").Vendor>;
}
