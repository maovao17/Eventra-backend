import { Model } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
export declare class VendorService {
    private vendorModel;
    constructor(vendorModel: Model<VendorDocument>);
    findByUserId(userId: string): Promise<Vendor | null>;
    updateProfile(userId: string, data: UpdateVendorDto): Promise<Vendor>;
    findAllCompleted(): Promise<Vendor[]>;
    getAllVendors(): Promise<Vendor[]>;
    approveVendor(id: string): Promise<Vendor>;
    rejectVendor(id: string): Promise<Vendor>;
    findOne(id: string): Promise<Vendor | null>;
    findOneOrThrow(id: string): Promise<Vendor>;
    findByUserIdOrThrow(userId: string): Promise<Vendor>;
    update(id: string, data: UpdateVendorDto): Promise<Vendor>;
}
