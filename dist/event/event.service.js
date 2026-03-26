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
    normalizeLocation(location) {
        if (!location) {
            return {};
        }
        if (typeof location === 'string') {
            return { label: location };
        }
        if (typeof location === 'object' && !Array.isArray(location)) {
            return location;
        }
        return {};
    }
    async create(dto) {
        const eventDate = dto.eventDate ?? dto.date;
        if (!eventDate) {
            throw new common_1.BadRequestException('eventDate is required');
        }
        const parsedDate = new Date(eventDate);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new common_1.BadRequestException('Invalid event date');
        }
        const createdEvent = new this.eventModel({
            customerId: dto.customerId,
            name: dto.name,
            date: parsedDate,
            eventDate,
            eventType: dto.eventType ?? 'Custom',
            location: this.normalizeLocation(dto.location),
            status: dto.status ?? 'draft',
            budget: Number(dto.budget),
            guestCount: Number(dto.guestCount ?? 0),
            coverImage: dto.coverImage ?? '',
            services: dto.services ?? [],
        });
        return createdEvent.save();
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
        const updatePayload = { ...dto };
        if (dto.eventDate) {
            const parsedDate = new Date(dto.eventDate);
            if (Number.isNaN(parsedDate.getTime())) {
                throw new common_1.BadRequestException('Invalid event date');
            }
            updatePayload.date = parsedDate;
        }
        if (dto.location !== undefined) {
            updatePayload.location = this.normalizeLocation(dto.location);
        }
        const updated = await this.eventModel.findByIdAndUpdate(id, updatePayload, { new: true }).exec();
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