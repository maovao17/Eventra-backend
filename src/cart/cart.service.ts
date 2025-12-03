import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  private sanitize(doc: any) {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return obj;
  }

  async create(dto: CreateCartDto) {
    try {
      const created = await this.cartModel.create(dto as any);
      return this.sanitize(created);
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async findAll(limit = 20, offset = 0) {
    const carts = await this.cartModel
      .find()
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return carts.map((c) => this.sanitize(c));
  }

  async findById(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Cart not found');
    const cart = await this.cartModel.findById(id).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    return this.sanitize(cart);
  }

  async findByUserId(user_id: string) {
    if (!isValidObjectId(user_id)) throw new BadRequestException('Invalid user_id');
    const cart = await this.cartModel.findOne({ user_id, status: 'active' }).exec();
    if (!cart) throw new NotFoundException('Cart not found for user');
    return this.sanitize(cart);
  }

  async findBySessionId(session_id: string) {
    const cart = await this.cartModel.findOne({ session_id, status: 'active' }).exec();
    if (!cart) throw new NotFoundException('Cart not found for session');
    return this.sanitize(cart);
  }

  async update(id: string, dto: UpdateCartDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Cart not found');
    try {
      const updated = await this.cartModel
        .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
        .exec();
      if (!updated) throw new NotFoundException('Cart not found');
      return this.sanitize(updated);
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Cart not found');
    const deleted = await this.cartModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Cart not found');
    return this.sanitize(deleted);
  }

  async addItem(cartId: string, item: any) {
    if (!isValidObjectId(cartId)) throw new NotFoundException('Cart not found');
    const cart = await this.cartModel.findById(cartId).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    
    cart.items.push(item);
    return this.sanitize(await cart.save());
  }

  async removeItem(cartId: string, itemIndex: number) {
    if (!isValidObjectId(cartId)) throw new NotFoundException('Cart not found');
    const cart = await this.cartModel.findById(cartId).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      throw new BadRequestException('Invalid item index');
    }
    
    cart.items.splice(itemIndex, 1);
    return this.sanitize(await cart.save());
  }

  async clearCart(cartId: string) {
    if (!isValidObjectId(cartId)) throw new NotFoundException('Cart not found');
    const cart = await this.cartModel.findById(cartId).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    
    cart.items = [];
    cart.sub_total = 0;
    cart.grand_total = 0;
    return this.sanitize(await cart.save());
  }
}
