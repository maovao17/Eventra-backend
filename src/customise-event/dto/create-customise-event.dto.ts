import { IsString, IsNotEmpty, IsDateString, IsArray, IsNumber } from 'class-validator';

export class CreateCustomiseEventDto {
  
  @IsNotEmpty()
  user_Id: string;

  @IsNotEmpty()
  template_Id: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsDateString()
  date: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsArray()
  selectedServices: string[];

  @IsArray()
  servicePriceSnapshots: any[];

  @IsNumber()
  totalBudget: number;

  @IsString()
  status: string;
}
