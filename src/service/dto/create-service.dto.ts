import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject, IsUrl, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  pricingModel?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  location: Record<string, any>;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  image?: string;

  @IsMongoId()
  vendor_Id: string;
}
