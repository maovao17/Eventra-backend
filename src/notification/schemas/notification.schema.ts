import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: false, trim: true })
  userId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Vendor' })
  vendorId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: false })
  bookingId?: string;

  @Prop({ required: false })
  vendorUserId?: string;

  @Prop({ required: false })
  daysBefore?: number;

  @Prop({ required: true, default: false })
  read: boolean;

  @Prop({ required: true })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.set('toJSON', { versionKey: false });
