import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  category?: string[];

  @IsOptional()
  location?: any;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  packages?: any[];
}
