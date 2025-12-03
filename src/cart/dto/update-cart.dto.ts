import { IsOptional, IsString, IsNumber, IsArray, IsMongoId, IsEnum, Min, Type } from 'class-validator';

export class UpdateCartDto {
  @IsOptional()
  @IsMongoId()
  user_id?: string;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsArray()
  items?: any[];

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sub_total?: number;

  @IsOptional()
  @IsArray()
  discounts?: any[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax_total?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  grand_total?: number;

  @IsOptional()
  @IsString()
  coupon_code?: string;

  @IsOptional()
  @IsEnum(['active', 'checked_out', 'expired', 'abandoned'])
  status?: string;

  @IsOptional()
  expires_at?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
