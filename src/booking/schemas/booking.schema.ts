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

  @Prop({ required: true, default: 'pending', enum: ['pending', 'accepted', 'rejected', 'confirmed', 'completed', 'cancelled'] })
  status: string;

  @Prop({ required: false, default: 'pending', enum: ['pending', 'partial', 'paid'] })
  paymentStatus?: string;

  @Prop({
    type: {
      type: { type: String, default: '' },
      date: { type: String, default: '' },
      time: { type: String, default: '' },
      location: { type: String, default: '' },
      guests: { type: Number, default: 0 },
    },
    default: {},
  })
  eventDetails?: {
    type?: string;
    date?: string;
    time?: string;
    location?: string;
    guests?: number;
  };

  @Prop({ type: [String], default: [] })
  completionImages?: string[];

  @Prop({ required: false, default: "pending", enum: ["pending", "paid"] })
  payoutStatus?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.set('toJSON', { versionKey: false });
