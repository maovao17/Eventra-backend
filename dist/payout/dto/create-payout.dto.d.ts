export declare class CreatePayoutDto {
    vendorId: string;
    eventId: string;
    bookingId?: string;
    totalEarned: number;
    commissionCut: number;
    payoutAmount: number;
}
