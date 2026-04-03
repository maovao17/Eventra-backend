import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    create(req: any, createCartDto: CreateCartDto): Promise<import("./schemas/cart.schema").CartDocument>;
    findAll(req: any, userId?: string): Promise<import("./schemas/cart.schema").CartDocument[]>;
    findByUserAndEvent(req: any, userId: string, eventId: string): Promise<import("./schemas/cart.schema").CartDocument | null>;
    findOne(req: any, id: string): Promise<import("./schemas/cart.schema").CartDocument>;
    assertCartAccess(req: any, id: string): Promise<import("./schemas/cart.schema").CartDocument>;
    update(req: any, id: string, updateCartDto: UpdateCartDto): Promise<import("./schemas/cart.schema").CartDocument>;
    addItem(req: any, userId: string, eventId: string, body: {
        vendorId: string;
        serviceId: string;
        serviceName: string;
        price: number;
    }): Promise<import("./schemas/cart.schema").CartDocument>;
    removeItem(req: any, id: string, itemIndex: number): Promise<import("./schemas/cart.schema").CartDocument>;
    remove(req: any, id: string): Promise<import("./schemas/cart.schema").CartDocument>;
}
