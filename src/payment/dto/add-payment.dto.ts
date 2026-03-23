import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddPaymentDto {
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  razorpay_payment_id: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}