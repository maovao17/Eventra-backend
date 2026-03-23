import { Model } from 'mongoose';
import { Payout, PayoutDocument } from './schemas/payout.schema';
import { CreatePayoutDto } from './dto/create-payout.dto';
export declare class PayoutService {
    private payoutModel;
    constructor(payoutModel: Model<PayoutDocument>);
    create(createPayoutDto: CreatePayoutDto): Promise<Payout>;
    findAll(): Promise<Payout[]>;
    findByVendor(vendorId: string): Promise<Payout[]>;
    findByEvent(eventId: string): Promise<Payout[]>;
    findOne(id: string): Promise<Payout>;
    update(id: string, updatePayoutDto: any): Promise<Payout>;
    remove(id: string): Promise<Payout>;
    markAsPaid(id: string): Promise<Payout>;
}
