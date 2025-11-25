import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  businessType: string;

  @Prop({ type: [String], default: [] })
  category: string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Service' }],
    required: true,
    default: [],
  })
  servicesOffered: Types.ObjectId[];

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
