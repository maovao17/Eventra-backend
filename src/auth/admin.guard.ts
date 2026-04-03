import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Admin access requires an authenticated user',
      );
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}
