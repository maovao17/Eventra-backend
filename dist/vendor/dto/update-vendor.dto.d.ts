declare class UpdateVendorLocationDto {
    city?: string;
    area?: string;
    address?: string;
}
declare class UpdateVendorPackageDto {
    name?: string;
    price?: number;
    description?: string;
    servicesIncluded?: string[];
}
export declare class UpdateVendorDto {
    businessName?: string;
    description?: string;
    category?: string[];
    location?: UpdateVendorLocationDto;
    experience?: string;
    packages?: UpdateVendorPackageDto[];
}
export {};
