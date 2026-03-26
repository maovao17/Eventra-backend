import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  razorpay_order_id: string;

  @IsNotEmpty()
  @IsString()
  razorpay_payment_id: string;

  @IsNotEmpty()
  @IsString()
razorpay_signature: string;

  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

