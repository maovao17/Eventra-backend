export declare class CreateEventDto {
    customerId?: string;
    name: string;
    date?: string;
    eventDate?: string;
    eventType?: string;
    location?: Record<string, any>;
    coverImage?: string;
    status?: string;
    budget: number;
    guestCount?: number;
    services?: string[];
}
