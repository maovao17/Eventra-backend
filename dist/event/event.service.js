"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_schema_1 = require("./schemas/event.schema");
let EventService = class EventService {
    eventModel;
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    async create(dto) {
        try {
            console.log("RAW DTO:", dto);
            const parsed = {
                name: dto.name,
                date: new Date(dto.date),
                budget: Number(dto.budget),
                services: dto.services || []
            };
            console.log("PARSED DTO:", parsed);
            const createdEvent = new this.eventModel(parsed);
            const saved = await createdEvent.save();
            console.log("SAVED EVENT:", saved);
            return saved;
        }
        catch (error) {
            console.error("CREATE EVENT ERROR:", error);
            throw error;
        }
    }
    async findAll() {
        return this.eventModel.find().exec();
    }
    async findById(id) {
        const event = await this.eventModel.findById(id).exec();
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async findByUser(userId) {
        return this.eventModel.find({ customerId: userId }).exec();
    }
    async update(id, dto) {
        console.log("UPDATE EVENT - ID:", id);
        console.log("UPDATE EVENT - DTO:", dto);
        console.log("UPDATE EVENT - Services type:", Array.isArray(dto.services) ? "array" : typeof dto.services);
        if (dto.services) {
            console.log("UPDATE EVENT - Services length:", dto.services.length);
            console.log("UPDATE EVENT - Services content:", dto.services);
        }
        const updated = await this.eventModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Event not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.eventModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Event not found');
        return deleted;
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EventService);
//# sourceMappingURL=event.service.js.map