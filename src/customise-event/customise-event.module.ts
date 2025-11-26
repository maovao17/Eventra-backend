import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomiseEventService } from './customise-event.service';
import { CustomiseEventController } from './customise-event.controller';
import { CustomiseEvent, CustomiseEventSchema } from './schemas/customise-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomiseEvent.name, schema: CustomiseEventSchema },
    ]),
  ],
  controllers: [CustomiseEventController],
  providers: [CustomiseEventService],
})
export class CustomiseEventModule {}
