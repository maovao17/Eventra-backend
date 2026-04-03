import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { VendorService } from '../vendor/vendor.service';
export declare class PayoutController {
    private readonly payoutService;
    private readonly vendorService;
    constructor(payoutService: PayoutService, vendorService: VendorService);
    create(createPayoutDto: CreatePayoutDto): Promise<import("./schemas/payout.schema").PayoutDocument>;
    findAll(req: any, vendorId?: string): Promise<import("./schemas/payout.schema").PayoutDocument[]>;
    findByVendorUser(req: any): Promise<import("./schemas/payout.schema").PayoutDocument[]>;
    findByEvent(req: any, eventId: string): Promise<import("./schemas/payout.schema").PayoutDocument[]>;
    findOne(req: any, id: string): Promise<import("./schemas/payout.schema").PayoutDocument>;
    update(id: string, updatePayoutDto: any): Promise<import("./schemas/payout.schema").PayoutDocument>;
    remove(id: string): Promise<import("./schemas/payout.schema").PayoutDocument>;
}
