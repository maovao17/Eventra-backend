import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PayoutDocument = Payout & Document;

@Schema({ timestamps: true })
export class Payout {
  @Prop({ required: false })
  bookingId?: string;

  @Prop({ required: false })
  paymentId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Vendor', required: true })
  vendorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  totalEarned: number;

  @Prop({ required: true })
  commissionCut: number;

  @Prop({ required: true })
  payoutAmount: number;

  @Prop({ required: true, enum: ['pending', 'paid'] })
  status: string;

  @Prop({ required: false })
  paidAt?: Date;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);
PayoutSchema.set('toJSON', { versionKey: false });
