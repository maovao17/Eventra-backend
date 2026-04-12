import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, unique: true })
  requestId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  vendorId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ required: false, default: 0 })
  price?: number;

  @Prop({ required: false })
  date?: string;

  @Prop({ required: false })
  time?: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ required: false })
  eventType?: string;

  @Prop({ required: false, default: 0 })
  guests?: number;

  @Prop({
    required: true,
    default: 'pending',
    enum: [
      'pending',
      'accepted',
      'rejected',
      'confirmed',
      'completed',
      'cancelled',
    ],
  })
  status: string;

  @Prop({
    required: false,
    default: 'pending',
    enum: ['pending', 'partial', 'paid'],
  })
  paymentStatus?: string;

  // Use Object/Mixed to avoid Mongoose treating "type" as a schema keyword
  @Prop({ type: Object, default: {} })
  eventDetails?: {
    type?: string;
    date?: string;
    time?: string;
    location?: string;
    guests?: number;
  };

  @Prop({ type: [String], default: [] })
  completionImages?: string[];

  @Prop({ required: false, default: 'pending', enum: ['pending', 'paid'] })
  payoutStatus?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Performance indexes
BookingSchema.index({ vendorId: 1, date: 1 });
BookingSchema.index({ customerId: 1, status: 1 });

BookingSchema.set('toJSON', { versionKey: false });
