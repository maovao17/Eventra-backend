import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as validator from 'validator';

export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true, validate: { validator: (v: string) => validator.isEmail(v), message: 'Invalid email' } })
  email: string;

  @Prop({ required: true, unique: true, trim: true, validate: { validator: (value: string) => /^(\+91)?[6-9]\d{9}$/.test(value), message: 'Invalid phone number' } })
  phone: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, trim: true })
  businessType: string;

  @Prop({ type: [String], default: [] })
  category: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Service' }], required: true, default: [] })
  servicesOffered: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Object, required: true })
  location: Record<string, any>;

  @Prop({ type: Array, required: true, default: [] })
  portfolio: any[];

  @Prop({ type: Array, default: [] })
  availability: any[];

  @Prop({ type: Array, required: true, default: [] })
  kycDocs: any[];

  @Prop({ default: false })
  isVerified: boolean;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

VendorSchema.set('toJSON', {
  versionKey: false,
});
