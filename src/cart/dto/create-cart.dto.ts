import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsNumber()
  price: number;
}

export class CreateCartDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsNumber()
  totalAmount: number;
}
