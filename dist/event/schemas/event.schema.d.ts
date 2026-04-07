import { Document } from 'mongoose';
export type EventDocument = Event & Document;
export declare class Event {
    customerId?: string;
    name: string;
    date: Date;
    eventDate?: string;
    eventType?: string;
    location?: Record<string, any>;
    status?: string;
    budget: number;
    guestCount?: number;
    coverImage?: string;
    services: string[];
}
export declare const EventSchema: import("mongoose").Schema<Event, import("mongoose").Model<Event, any, any, any, Document<unknown, any, Event, any, {}> & Event & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Event, Document<unknown, {}, import("mongoose").FlatRecord<Event>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Event> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
