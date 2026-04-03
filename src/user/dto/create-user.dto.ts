// This is DTO for creating a user, it defines the structure of data required to create a new user in the system.
// The attributes defined here will be taken as input from user

import { IsEnum, IsOptional, IsString, IsUrl, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  profile_photo?: string;

  @IsString()
  userId: string;

  @IsString()
  @IsEnum(['phone', 'google'])
  authProvider: 'phone' | 'google';

  @IsString()
  @IsEnum(['customer', 'vendor', 'admin'])
  role: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}
