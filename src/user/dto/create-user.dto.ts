// This is DTO for creating a user, it defines the structure of data required to create a new user in the system.
// The attributes defined here will be taken as input from user

import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
@IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  profile_photo?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['customer', 'vendor'])
  role: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}
