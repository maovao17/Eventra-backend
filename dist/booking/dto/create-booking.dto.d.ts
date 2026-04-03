export declare class CreateBookingDto {
    requestId: string;
    customerId: string;
    vendorId: string;
    eventId: string;
    amount?: number;
    price?: number;
    date?: string;
    time?: string;
    location?: string;
    eventType?: string;
    guests?: number;
    status?: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed' | 'cancelled';
}
