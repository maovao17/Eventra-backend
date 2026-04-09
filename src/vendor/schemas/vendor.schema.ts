import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VendorDocument = HydratedDocument<Vendor>;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop()
  businessName?: string;

  @Prop()
  description?: string;

  @Prop([String])
  category?: string[];

  @Prop()
  location?: any;

  @Prop()
  experience?: string;

  @Prop()
  profileImage?: string;

  @Prop([{ url: String, caption: String }])
  portfolio?: Array<{ url: string; caption: string }>;

  @Prop({ default: false })
  profileCompleted!: boolean;

  @Prop()
  packages?: any[];
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
