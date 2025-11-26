import { IsOptional, IsString, IsEmail, Matches, IsArray, IsObject, IsBoolean, IsMongoId } from 'class-validator';

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+91)?[6-9]\d{9}$/, { message: 'Phone number Invalid.' })
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsArray()
  category?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  servicesOffered?: string[];

  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @IsOptional()
  @IsArray()
  portfolio?: any[];

  @IsOptional()
  @IsArray()
  availability?: any[];

  @IsOptional()
  @IsArray()
  kycDocs?: any[];

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
