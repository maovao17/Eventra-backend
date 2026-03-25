import { IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(100)
  amount: number;
}

