import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  item_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['service', 'product', 'custom_event', 'template_addon'] })
  item_type: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
  vendor_id?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 1 })
  qty: number;

  @Prop({ required: true, min: 0 })
  unit_price: number;

  @Prop({ required: false, default: 0 })
  tax_amount?: number;

  @Prop({ required: false, default: 0 })
  discounted_amount?: number;

  @Prop({ required: true, min: 0 })
  total_price: number;

  @Prop({ type: Object, required: false })
  meta?: Record<string, any>;
}

@Schema({ _id: false })
export class CartDiscount {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
  coupon_id?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, trim: true })
  code?: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: false })
  reason?: string;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: 'User' })
  user_id?: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, trim: true })
  session_id?: string;

  @Prop({ type: [CartItem], required: true, default: [] })
  items: CartItem[];

  @Prop({ required: true, default: 'USD', trim: true })
  currency: string;

  @Prop({ required: true, default: 0, min: 0 })
  sub_total: number;

  @Prop({ type: [CartDiscount], required: true, default: [] })
  discounts: CartDiscount[];

  @Prop({ required: true, default: 0, min: 0 })
  tax_total: number;

  @Prop({ required: true, default: 0, min: 0 })
  grand_total: number;

  @Prop({ required: false, trim: true })
  coupon_code?: string;

  @Prop({ required: true, default: 'active', enum: ['active', 'checked_out', 'expired', 'abandoned'] })
  status: string;

  @Prop({ required: false })
  expires_at?: Date;

  @Prop({ required: false })
  notes?: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
export const CartItemSchema = SchemaFactory.createForClass(CartItem);
export const CartDiscountSchema = SchemaFactory.createForClass(CartDiscount);

CartSchema.set('toJSON', { versionKey: false });
