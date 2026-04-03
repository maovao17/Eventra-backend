import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { FirebaseAuthGuard } from './firebase.guard';
import { RolesGuard } from './roles.guard';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [UserModule],
  providers: [FirebaseAuthGuard, RolesGuard, AdminGuard],
  exports: [FirebaseAuthGuard, RolesGuard, AdminGuard, UserModule],
})
export class AuthModule {}
