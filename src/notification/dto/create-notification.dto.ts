import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  daysBefore?: number;
}
