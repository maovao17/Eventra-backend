import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CustomiseEventDocument = HydratedDocument<CustomiseEvent>;

@Schema({ timestamps: true })
export class CustomiseEvent {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_Id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Template', required: true })
  template_Id: Types.ObjectId;

  @Prop({ required: true })
  eventName: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ type: [Types.ObjectId], ref: 'Service', default: [] })
  selectedServices: Types.ObjectId[];

  @Prop({ type: Array, default: [] })
  servicePriceSnapshots: any[];

  @Prop({ required: true })
  totalBudget: number;

  @Prop({ default: 'pending' })
  status: string;
}

export const CustomiseEventSchema = SchemaFactory.createForClass(CustomiseEvent);
