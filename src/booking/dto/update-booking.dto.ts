import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum([
    'pending',
    'accepted',
    'rejected',
    'confirmed',
    'completed',
    'cancelled',
  ])
  status?: string;

  @IsOptional()
  @IsEnum(['pending', 'partial', 'paid'])
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  eventType?: string;
}
