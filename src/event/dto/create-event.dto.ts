import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  date: string; // keep as string (frontend sends string)

  @IsNumber()
  budget: number;

  @IsArray()
  @IsOptional()
  services?: string[];
}
