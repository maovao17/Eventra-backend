import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePayoutDto {
  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsNumber()
  totalEarned: number;

  @IsNumber()
  commissionCut: number;

  @IsNumber()
  payoutAmount: number;
}
