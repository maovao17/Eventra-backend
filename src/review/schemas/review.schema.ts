import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: false })
  userId?: string;

  @Prop({ required: true })
  vendorId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ required: false })
  text?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ required: false })
  reply?: string;

  @Prop({ required: false })
  replyBy?: string;

  @Prop({ required: false })
  repliedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.set('toJSON', { versionKey: false });
