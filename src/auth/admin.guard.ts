import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.uid ?? request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Admin access requires an authenticated user');
    }

    const user = await this.userService.findByUserId(String(userId));
    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
