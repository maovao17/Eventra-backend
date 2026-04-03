import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserService } from '../user/user.service';
import { AuthenticatedUser } from '../types/auth.types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No Firebase token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Fetch user from database to get role and other details
      const dbUser = await this.userService.findByUserId(decodedToken.uid);
      if (!dbUser) {
        throw new UnauthorizedException('User not found in database');
      }

      const authenticatedUser: AuthenticatedUser = {
        uid: decodedToken.uid,
        id: decodedToken.uid,
        email: decodedToken.email || dbUser.email || '',
        phoneNumber: decodedToken.phone_number || dbUser.phoneNumber || '',
        role: dbUser.role as 'customer' | 'vendor' | 'admin',
        userId: dbUser.userId,
        name: dbUser.name,
        businessName: dbUser.businessName,
      };

      request.user = authenticatedUser;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
