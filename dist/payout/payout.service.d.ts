import { Model } from 'mongoose';
import { PayoutDocument } from './schemas/payout.schema';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { BookingDocument } from '../booking/schemas/booking.schema';
export declare class PayoutService {
    private payoutModel;
    private bookingModel;
    constructor(payoutModel: Model<PayoutDocument>, bookingModel: Model<BookingDocument>);
    create(createPayoutDto: CreatePayoutDto): Promise<PayoutDocument>;
    findAll(): Promise<PayoutDocument[]>;
    findByVendor(vendorId: string): Promise<PayoutDocument[]>;
    findByEvent(eventId: string): Promise<PayoutDocument[]>;
    findByBooking(bookingId: string): Promise<PayoutDocument | null>;
    findOne(id: string): Promise<PayoutDocument>;
    update(id: string, updatePayoutDto: any): Promise<PayoutDocument>;
    remove(id: string): Promise<PayoutDocument>;
    markAsPaid(id: string): Promise<PayoutDocument>;
}
