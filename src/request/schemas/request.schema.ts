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

  @Prop({
    required: true,
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected'],
  })
  status: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);

// Performance indexes
RequestSchema.index({ customerId: 1 });
RequestSchema.index({ vendorId: 1 });
RequestSchema.index({ eventId: 1 });
RequestSchema.index({ customerId: 1, vendorId: 1, eventId: 1 }); // Compound index for complex queries

RequestSchema.set('toJSON', { versionKey: false });
