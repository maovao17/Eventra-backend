import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type VendorDocument = Vendor & Document;

export class VendorPackage {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: false, default: '' })
  description?: string;

  @Prop({ type: [String], default: [] })
  servicesIncluded?: string[];
}

export class VendorServiceItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, default: 0, min: 0 })
  price?: number;

  @Prop({ required: false, default: '', trim: true })
  description?: string;
}

export class VendorPortfolioItem {
  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ required: false, default: '', trim: true })
  caption?: string;

  @Prop({ required: false, default: '', trim: true })
  category?: string;

  @Prop({ required: true, default: () => new Date() })
  uploadedAt: Date;
}

export class VendorWorkingHours {
  @Prop({ required: false, default: '09:00' })
  start?: string;

  @Prop({ required: false, default: '18:00' })
  end?: string;
}

export class VendorAvailability {
  @Prop({ type: [Date], default: [] })
  blockedDates?: Date[];

  @Prop({ type: VendorWorkingHours, default: {} })
  workingHours?: VendorWorkingHours;
}

export class VendorLocation {
  @Prop({ required: false, default: '', trim: true })
  city?: string;

  @Prop({ required: false, default: '', trim: true })
  area?: string;

  @Prop({ required: false, default: '', trim: true })
  address?: string;
}

export class VendorBankDetails {
  @Prop({ required: false, default: '', trim: true })
  accountHolder?: string;

  @Prop({ required: false, default: '', trim: true })
  accountNumber?: string;

  @Prop({ required: false, default: '', trim: true })
  ifsc?: string;

  @Prop({ required: false, default: '', trim: true })
  bankName?: string;
}

@Schema({ timestamps: true })
export class Vendor {
  _id: Types.ObjectId;

  @Prop({ required: false, trim: true })
  userId?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, unique: true, sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ required: false, unique: true, sparse: true, trim: true })
  phone?: string;

  @Prop({ required: false, trim: true })
  businessType?: string;

  @Prop({ required: false, default: '', trim: true })
  description?: string;

  @Prop({ type: [String], default: [] })
  category?: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Service' }], default: [] })
  servicesOffered?: Types.ObjectId[];

  @Prop({ type: VendorLocation, default: {} })
  location?: VendorLocation;

  @Prop({ type: [VendorPortfolioItem], default: [] })
  portfolio?: VendorPortfolioItem[];

  @Prop({ type: VendorAvailability, default: {} })
  availability?: VendorAvailability;

  @Prop({ type: [String], default: [] })
  kycDocs?: string[];

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ default: 0, min: 0 })
  rating?: number;

  @Prop({ default: 0, min: 0 })
  totalReviews?: number;

  // Legacy compatibility fields used by existing frontend
  @Prop({ required: false, default: 0 })
  price?: number;

  @Prop({ required: false, default: '' })
  image?: string;

  @Prop({ required: false, default: '1 hour' })
  responseTime?: string;

  @Prop({ required: false, default: '' })
  businessName?: string;

  @Prop({ required: false, default: '' })
  experience?: string;

  @Prop({ required: false, default: '' })
  profileImage?: string;

  @Prop({ required: false, default: '' })
  coverImage?: string;

  @Prop({ type: [VendorServiceItem], default: [] })
  services?: VendorServiceItem[];

  @Prop({ type: [VendorPackage], default: [] })
  packages?: VendorPackage[];

  @Prop({ type: [String], default: [] })
  gallery?: string[];

  @Prop({ type: [Object], default: [] })
  reviews?: any[];

  @Prop({ default: false })
  verified?: boolean;

  @Prop({ type: VendorBankDetails, default: {} })
  bankDetails?: VendorBankDetails;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
VendorSchema.set('toJSON', { versionKey: false });
