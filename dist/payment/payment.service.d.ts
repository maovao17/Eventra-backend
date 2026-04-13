import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { BookingService } from '../booking/booking.service';
import { RequestService } from '../request/request.service';
import { UserService } from '../user/user.service';
import { PayoutService } from '../payout/payout.service';
import { NotificationService } from '../notification/notification.service';
export declare class PaymentService {
    private paymentModel;
    private bookingService;
    private requestService;
    private userService;
    private payoutService;
    private notificationService;
    private razorpay;
    constructor(paymentModel: Model<PaymentDocument>, bookingService: BookingService, requestService: RequestService, userService: UserService, payoutService: PayoutService, notificationService: NotificationService);
    private buildPaymentBreakdown;
    private ensurePayoutRecord;
    private getRazorpayKeySecret;
    private getRazorpayClient;
    private getRazorpayWebhookSecret;
    private verifyRazorpayWebhookSignature;
    private fetchRazorpayPayment;
    private validateRazorpayPayment;
    private findSuccessfulPaymentByBooking;
    private isDuplicateKeyError;
    create(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    findAll(): Promise<Payment[]>;
    findByUser(customerId: string): Promise<Payment[]>;
    findByCustomer(customerId: string): Promise<Payment[]>;
    findByVendorUser(vendorUserId: string): Promise<Payment[]>;
    findByBooking(bookingId: string): Promise<Payment[]>;
    findOne(id: string): Promise<Payment>;
    assertVendorCanAccessPayment(paymentId: string, vendorUserId: string): Promise<Payment>;
    update(id: string, updatePaymentDto: Partial<CreatePaymentDto>): Promise<Payment>;
    remove(id: string): Promise<Payment>;
    processRazorpayWebhook(rawBody: string, signature: string): Promise<{
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
    getRevenue(): Promise<{
        totalRevenue: number;
        successfulPayments: number;
        failedPayments: number;
    }>;
    createRazorpayOrder(bookingId: string, actorUserId: string): Promise<{
        orderId: string;
        amount: number;
    }>;
    verifyPayment(dto: VerifyPaymentDto, actorUserId: string): Promise<{
        success: boolean;
        paymentId: string;
    }>;
}
