import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async issueToken(userId: string) {
    const user = await this.userService.findByUserId(userId);

    const payload = {
      sub: userId,
      email: `${userId}@eventra.local`,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      userId,
      role: user.role,
    };
  }
}
