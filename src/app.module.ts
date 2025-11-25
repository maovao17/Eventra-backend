import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CustomiseEventModule } from './customise-event/customise-event.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(
      'mongodb://Sybil:jeni23@localhost:27017/Eventra38?authSource=admin'
    ),

    UserModule,
    CustomiseEventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
