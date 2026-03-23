import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BookingService } from '../booking/booking.service';
import { RequestService } from '../request/request.service';
import { UserService } from '../user/user.service';
export declare class PaymentService {
    private paymentModel;
    private bookingService;
    private requestService;
    private userService;
    constructor(paymentModel: Model<PaymentDocument>, bookingService: BookingService, requestService: RequestService, userService: UserService);
    create(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    findAll(): Promise<Payment[]>;
    findByUser(customerId: string): Promise<Payment[]>;
    findByBooking(bookingId: string): Promise<Payment[]>;
    findOne(id: string): Promise<Payment>;
    update(id: string, updatePaymentDto: Partial<CreatePaymentDto>): Promise<Payment>;
    remove(id: string): Promise<Payment>;
    getRevenue(): Promise<{
        totalRevenue: number;
        successfulPayments: number;
        failedPayments: number;
    }>;
}
