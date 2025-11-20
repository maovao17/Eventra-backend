// This is DTO for creating a user, it defines the structure of data required to create a new user in the system.
// The attributes defined here will be taken as input from user

import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  profile_photo?: string;
}
