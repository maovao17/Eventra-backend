import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsEnum(['draft', 'planning', 'confirmed', 'ongoing', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  services?: string[];
}
