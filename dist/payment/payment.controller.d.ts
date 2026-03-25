import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    create(createPaymentDto: CreatePaymentDto): Promise<import("./schemas/payment.schema").Payment>;
    findAll(userId?: string, customerId?: string, bookingId?: string): Promise<import("./schemas/payment.schema").Payment[]>;
    findOne(id: string): Promise<import("./schemas/payment.schema").Payment>;
    update(id: string, updatePaymentDto: Partial<CreatePaymentDto>): Promise<import("./schemas/payment.schema").Payment>;
    remove(id: string): Promise<import("./schemas/payment.schema").Payment>;
    getRevenue(): Promise<{
        totalRevenue: number;
        successfulPayments: number;
        failedPayments: number;
    }>;
    createOrder(createOrderDto: CreateOrderDto): Promise<{
        orderId: string;
        amount: number;
    }>;
    verify(dto: VerifyPaymentDto): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
}
