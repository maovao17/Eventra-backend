import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    create(req: {
        user: {
            uid: string;
        };
    }, createPaymentDto: CreatePaymentDto): Promise<import("./schemas/payment.schema").Payment>;
    findAll(req: {
        user: {
            uid: string;
            role: string;
        };
    }, userId?: string, customerId?: string, bookingId?: string): Promise<import("./schemas/payment.schema").Payment[]>;
    findOne(req: {
        user: {
            uid: string;
            role: string;
        };
    }, id: string): Promise<import("./schemas/payment.schema").Payment>;
    update(id: string, updatePaymentDto: Partial<CreatePaymentDto>): Promise<import("./schemas/payment.schema").Payment>;
    remove(id: string): Promise<import("./schemas/payment.schema").Payment>;
    getRevenue(): Promise<{
        totalRevenue: number;
        successfulPayments: number;
        failedPayments: number;
    }>;
    createOrder(req: {
        user: {
            uid: string;
        };
    }, createOrderDto: CreateOrderDto): Promise<{
        orderId: string;
        amount: number;
    }>;
    verify(req: {
        user: {
            uid: string;
        };
    }, dto: VerifyPaymentDto): Promise<{
        success: boolean;
        message: string;
        paymentId?: undefined;
    } | {
        success: boolean;
        paymentId: string;
        message?: undefined;
    }>;
    webhook(req: {
        rawBody?: string;
        body?: unknown;
    }, signature: string): Promise<{
        success: boolean;
        message: string;
        paymentId?: undefined;
    } | {
        success: boolean;
        paymentId: string;
        message: string;
    } | {
        success: boolean;
        paymentId: string;
        message?: undefined;
    }>;
}
