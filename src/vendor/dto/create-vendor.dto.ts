import { IsNotEmpty, IsString, IsEmail, Matches, IsArray, ArrayNotEmpty, IsOptional, IsObject, IsBoolean, IsMongoId } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^(\+91)?[6-9]\d{9}$/, { message: 'Phone number Invalid.' })
  phone: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty()
  businessType: string;

  @IsOptional()
  @IsArray()
  category?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  servicesOffered: string[];

  @IsObject()
  location: Record<string, any>;

  @IsArray()
  @ArrayNotEmpty()
  portfolio: any[];

  @IsOptional()
  @IsArray()
  availability?: any[];

  @IsArray()
  @ArrayNotEmpty()
  kycDocs: any[];

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
