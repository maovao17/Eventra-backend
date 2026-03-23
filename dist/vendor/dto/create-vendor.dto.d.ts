declare class CreateVendorPackageDto {
    name: string;
    price: number;
    description?: string;
    servicesIncluded?: string[];
}
declare class CreateVendorPortfolioItemDto {
    url: string;
    caption?: string;
    category?: string;
    uploadedAt?: string;
}
declare class CreateVendorLocationDto {
    city?: string;
    area?: string;
    address?: string;
}
declare class CreateVendorWorkingHoursDto {
    start?: string;
    end?: string;
}
declare class CreateVendorAvailabilityDto {
    blockedDates?: string[];
    workingHours?: CreateVendorWorkingHoursDto;
}
export declare class CreateVendorDto {
    name: string;
    userId?: string;
    email?: string;
    phone?: string;
    businessType?: string;
    description?: string;
    category?: string[];
    servicesOffered?: string[];
    location?: CreateVendorLocationDto;
    portfolio?: CreateVendorPortfolioItemDto[];
    availability?: CreateVendorAvailabilityDto;
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
    services?: string[];
    packages?: CreateVendorPackageDto[];
    gallery?: string[];
    reviews?: any[];
    verified?: boolean;
    locationLegacy?: Record<string, any>;
}
export {};
