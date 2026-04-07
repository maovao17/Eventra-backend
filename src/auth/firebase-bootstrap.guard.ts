import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseBootstrapGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No Firebase token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      request.user = {
        uid: decodedToken.uid,
        id: decodedToken.uid,
        userId: decodedToken.uid,
        email: decodedToken.email || '',
        phoneNumber: decodedToken.phone_number || '',
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
