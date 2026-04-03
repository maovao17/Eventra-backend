export declare class CreatePaymentDto {
    bookingId: string;
    customerId: string;
    amount: number;
    requestId: string;
    status: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
}
