import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  issueToken(@Body('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return this.authService.issueToken(userId);
  }
}
