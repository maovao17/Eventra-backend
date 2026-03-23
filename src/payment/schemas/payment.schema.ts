import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ _id: false })
@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['success', 'failed'] })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.set('toJSON', { versionKey: false });
