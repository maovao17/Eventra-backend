import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventController {
    private readonly eventService;
    constructor(eventService: EventService);
    create(dto: CreateEventDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").EventDocument, {}, {}> & import("./schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(userId?: string, customerId?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/event.schema").EventDocument, {}, {}> & import("./schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").EventDocument, {}, {}> & import("./schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateEventDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").EventDocument, {}, {}> & import("./schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").EventDocument, {}, {}> & import("./schemas/event.schema").Event & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
