import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  vendorId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true, default: 'pending', enum: ['pending', 'accepted', 'rejected'] })
  status: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
RequestSchema.set('toJSON', { versionKey: false });
