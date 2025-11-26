import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TemplateDocument = Template & Document;

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  category?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }], default: [] })
  servicesIncluded: Types.ObjectId[];

  @Prop()
  image?: string;

  @Prop({ type: Number, default: 0 })
  estimatedBudget: number;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
