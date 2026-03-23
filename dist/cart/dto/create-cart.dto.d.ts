declare class CartItemDto {
    vendorId: string;
    serviceId: string;
    price: number;
}
export declare class CreateCartDto {
    userId: string;
    eventId: string;
    items: CartItemDto[];
    totalAmount: number;
}
export {};
