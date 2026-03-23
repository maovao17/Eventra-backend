import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreatePayoutDto {
  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNumber()
  totalEarned: number;

  @IsNumber()
  commissionCut: number;

  @IsNumber()
  payoutAmount: number;
}