import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true })
  vendorId: Types.ObjectId;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  price: number;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ type: [CartItem], required: true })
  items: CartItem[];

  @Prop({ required: true })
  totalAmount: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

CartSchema.set('toJSON', { versionKey: false });
