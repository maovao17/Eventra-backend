import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
export declare class PayoutController {
    private readonly payoutService;
    constructor(payoutService: PayoutService);
    create(createPayoutDto: CreatePayoutDto): Promise<import("./schemas/payout.schema").Payout>;
    findAll(vendorId?: string): Promise<import("./schemas/payout.schema").Payout[]>;
    findByEvent(eventId: string): Promise<import("./schemas/payout.schema").Payout[]>;
    findOne(id: string): Promise<import("./schemas/payout.schema").Payout>;
    update(id: string, updatePayoutDto: any): Promise<import("./schemas/payout.schema").Payout>;
    markAsPaid(id: string): Promise<import("./schemas/payout.schema").Payout>;
    remove(id: string): Promise<import("./schemas/payout.schema").Payout>;
}
