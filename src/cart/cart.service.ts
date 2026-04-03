import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async create(createCartDto: CreateCartDto): Promise<CartDocument> {
    const createdCart = new this.cartModel(createCartDto);
    return createdCart.save();
  }

  async findAll(): Promise<CartDocument[]> {
    return this.cartModel.find().exec();
  }

  async findByUserAndEvent(
    userId: string,
    eventId: string,
  ): Promise<CartDocument | null> {
    return this.cartModel.findOne({ userId, eventId }).exec();
  }

  async findByUser(userId: string): Promise<CartDocument[]> {
    return this.cartModel.find({ userId }).exec();
  }

  async findOne(id: string): Promise<CartDocument> {
    const cart = await this.cartModel.findById(id).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async update(
    id: string,
    updateCartDto: UpdateCartDto,
  ): Promise<CartDocument> {
    const updated = await this.cartModel
      .findByIdAndUpdate(id, updateCartDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Cart not found');
    return updated;
  }

  async remove(id: string): Promise<CartDocument> {
    const deleted = await this.cartModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Cart not found');
    return deleted;
  }

  async addItem(
    userId: string,
    eventId: string,
    vendorId: string,
    serviceId: string,
    serviceName: string,
    price: number,
  ): Promise<CartDocument> {
    let cart = await this.findByUserAndEvent(userId, eventId);
    if (!cart) {
      cart = await this.create({ userId, eventId, items: [], totalAmount: 0 });
    }
    cart.items.push({
      vendorId: new Types.ObjectId(vendorId),
      serviceId: new Types.ObjectId(serviceId),
      serviceName,
      price,
    });
    cart.totalAmount += price;
    return cart.save();
  }

  async removeItem(cartId: string, itemIndex: number): Promise<CartDocument> {
    const cart = await this.findOne(cartId);
    if (itemIndex >= 0 && itemIndex < cart.items.length) {
      cart.totalAmount -= cart.items[itemIndex].price;
      cart.items.splice(itemIndex, 1);
      return cart.save();
    }
    throw new NotFoundException('Item not found');
  }
}
