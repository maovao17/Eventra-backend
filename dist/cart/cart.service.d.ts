import { Model } from 'mongoose';
import { CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
export declare class CartService {
    private cartModel;
    constructor(cartModel: Model<CartDocument>);
    create(createCartDto: CreateCartDto): Promise<CartDocument>;
    findAll(): Promise<CartDocument[]>;
    findByUserAndEvent(userId: string, eventId: string): Promise<CartDocument | null>;
    findByUser(userId: string): Promise<CartDocument[]>;
    findOne(id: string): Promise<CartDocument>;
    update(id: string, updateCartDto: UpdateCartDto): Promise<CartDocument>;
    remove(id: string): Promise<CartDocument>;
    addItem(userId: string, eventId: string, vendorId: string, serviceId: string, serviceName: string, price: number): Promise<CartDocument>;
    removeItem(cartId: string, itemIndex: number): Promise<CartDocument>;
}
