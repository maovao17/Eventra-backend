import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: false })
  customerId?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: false })
  eventDate?: string;

  @Prop({ required: false, trim: true, default: 'Custom' })
  eventType?: string;

  @Prop({ type: Object, required: false, default: {} })
  location?: Record<string, any>;

  @Prop({
    required: false,
    default: 'draft',
    enum: [
      'draft',
      'planning',
      'confirmed',
      'ongoing',
      'completed',
      'cancelled',
    ],
  })
  status?: string;

  @Prop({ required: true })
  budget: number;

  @Prop({ required: false, default: 0 })
  guestCount?: number;

  @Prop({ required: false })
  coverImage?: string;

  @Prop({ type: [String], default: [] })
  services: string[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.set('toJSON', {
  versionKey: false,
  virtuals: true,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    return ret;
  },
});
