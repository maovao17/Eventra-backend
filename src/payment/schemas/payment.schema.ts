import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ _id: false })
@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: false })
  eventId?: string;

  @Prop({ required: false })
  vendorId?: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: false, default: 0 })
  bookingAmount?: number;

  @Prop({ required: false, default: 0 })
  platformFee?: number;

  @Prop({ required: false, default: 0 })
  commissionAmount?: number;

  @Prop({ required: false, default: 0 })
  vendorPayoutAmount?: number;

  @Prop({ required: false })
  payoutId?: string;

  @Prop({ required: false })
  razorpayPaymentId?: string;

  @Prop({ required: false })  razorpayOrderId?: string;  @Prop({ required: true, enum: ['paid', 'failed'] }) status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Performance indexes
PaymentSchema.index(  { bookingId: 1 },  {  unique: true, partialFilterExpression: { status: 'paid' },  },);
PaymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ razorpayOrderId: 1 });

PaymentSchema.set('toJSON', { versionKey: false });
