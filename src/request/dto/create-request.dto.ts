import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;
}
