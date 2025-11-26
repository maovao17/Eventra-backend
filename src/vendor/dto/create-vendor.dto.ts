import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  businessType: string;

  @IsArray()
  @IsOptional()
  category?: string[];

  @IsArray()
  @IsOptional()
  servicesOffered?: string[];

  @IsObject()
  location: Record<string, any>;

  @IsArray()
  portfolio: any[];

  @IsArray()
  @IsOptional()
  availability?: any[];

  @IsArray()
  kycDocs: any[];

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
