import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    create(createCartDto: CreateCartDto): Promise<import("./schemas/cart.schema").CartDocument>;
    findAll(userId?: string): Promise<import("./schemas/cart.schema").CartDocument[]>;
    findOne(id: string): Promise<import("./schemas/cart.schema").CartDocument>;
    findByUserAndEvent(userId: string, eventId: string): Promise<import("./schemas/cart.schema").CartDocument | null>;
    update(id: string, updateCartDto: UpdateCartDto): Promise<import("./schemas/cart.schema").CartDocument>;
    addItem(userId: string, eventId: string, body: {
        vendorId: string;
        serviceId: string;
        serviceName: string;
        price: number;
    }): Promise<import("./schemas/cart.schema").CartDocument>;
    removeItem(id: string, itemIndex: number): Promise<import("./schemas/cart.schema").CartDocument>;
    remove(id: string): Promise<import("./schemas/cart.schema").CartDocument>;
}
