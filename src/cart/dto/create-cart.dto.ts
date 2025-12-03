import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsObject, IsMongoId, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsMongoId()
  item_id: string;

  @IsEnum(['service', 'product', 'custom_event', 'template_addon'])
  item_type: string;

  @IsOptional()
  @IsMongoId()
  vendor_id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  qty: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax_amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discounted_amount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_price: number;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class CreateCartDto {
  @IsOptional()
  @IsMongoId()
  user_id?: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsArray()
  items: CartItemDto[];

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['active', 'checked_out', 'expired', 'abandoned'])
  status?: string;

  @IsOptional()
  @IsString()
  coupon_code?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
