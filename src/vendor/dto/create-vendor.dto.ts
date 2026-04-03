import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateVendorPackageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicesIncluded?: string[];
}

class CreateVendorPortfolioItemDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  uploadedAt?: string;
}

class CreateVendorLocationDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

class CreateVendorWorkingHoursDto {
  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;
}

class CreateVendorAvailabilityDto {
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  blockedDates?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVendorWorkingHoursDto)
  workingHours?: CreateVendorWorkingHoursDto;
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : typeof value === 'string' && value.trim()
        ? [value.trim()]
        : [],
  )
  @IsArray()
  @IsString({ each: true })
  category?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  servicesOffered?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVendorLocationDto)
  location?: CreateVendorLocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVendorPortfolioItemDto)
  portfolio?: CreateVendorPortfolioItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVendorAvailabilityDto)
  availability?: CreateVendorAvailabilityDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kycDocs?: string[];

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalReviews?: number;

  // Legacy compatibility fields
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  responseTime?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVendorPackageDto)
  packages?: CreateVendorPackageDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsArray()
  reviews?: any[];

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsObject()
  locationLegacy?: Record<string, any>;
}
