import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VendorDocument = HydratedDocument<Vendor>;

class Package {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop()
  description?: string;

  @Prop([String])
  servicesIncluded?: string[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);

class Location {
  @Prop()
  city?: string;

  @Prop()
  area?: string;

  @Prop()
  address?: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

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

  @Prop({ type: LocationSchema })
  location?: Location;

  @Prop()
  experience?: string;

  @Prop()
  profileImage?: string;

  @Prop([{ url: String, caption: String }])
  portfolio?: Array<{ url: string; caption: string }>;

  @Prop({ default: false })
  profileCompleted!: boolean;

  @Prop({ default: false })
  isApproved!: boolean;

  @Prop([{ type: PackageSchema }])
  packages?: Package[];

  @Prop()
  status?: string;

  @Prop({ default: false })
  isVerified?: boolean;

}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

