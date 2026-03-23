import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateRequestDto {
  @IsOptional()
  @IsEnum(['pending', 'accepted', 'rejected'])
  status: string;

  @IsOptional()
  @IsString()
  actorUserId?: string;
}
