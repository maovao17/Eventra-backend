import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRequestDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  packageName?: string;
}
