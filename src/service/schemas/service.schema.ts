import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as validator from 'validator';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: false })
  price?: number;

  @Prop({ required: false, trim: true })
  pricingModel?: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ type: Object, required: false })
  location?: Record<string, any>;

  @Prop({ required: false, trim: true, validate: { validator: (v: string) => !v || validator.isURL(v, { require_protocol: true }), message: 'Invalid image URL' } })
  image?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Vendor', required: false })
  vendor_Id?: MongooseSchema.Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.set('toJSON', { versionKey: false });
