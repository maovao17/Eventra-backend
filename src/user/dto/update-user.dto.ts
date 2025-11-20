// This DTO is where the data which can be updated are defined

import { IsOptional, IsString, Matches, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^(\+91[\-\s]?)?[6-9]\d{9}$/, {
    message: 'Phone number Invalid.',
  })
  phone_number?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl(
    { require_protocol: true }, 
    { message: 'profile_photo must be a valid URL (include http/https).' })
  profile_photo?: string;
}
