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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
const events_gateway_1 = require("../events/events.gateway");
let NotificationService = class NotificationService {
    notificationModel;
    bookingModel;
    eventsGateway;
    constructor(notificationModel, bookingModel, eventsGateway) {
        this.notificationModel = notificationModel;
        this.bookingModel = bookingModel;
        this.eventsGateway = eventsGateway;
    }
    onModuleInit() {
        void this.generateEventReminders();
        const interval = setInterval(() => {
            void this.generateEventReminders();
        }, 12 * 60 * 60 * 1000);
        interval.unref();
    }
    async create(createNotificationDto) {
        const createdNotification = new this.notificationModel({
            ...createNotificationDto,
            read: false,
            createdAt: new Date(),
        });
        const saved = await createdNotification.save();
        this.eventsGateway.broadcastNotification({
            message: saved.message,
            type: saved.type,
            bookingId: saved.bookingId ? String(saved.bookingId) : undefined,
            vendorId: saved.vendorId ? String(saved.vendorId) : undefined,
            userId: saved.userId ? String(saved.userId) : undefined,
        });
        return saved;
    }
    async generateEventReminders() {
        const bookings = await this.bookingModel
            .find({
            status: { $in: ['accepted', 'confirmed'] },
        })
            .exec();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (const booking of bookings) {
            if (!booking.date)
                continue;
            const eventDate = new Date(booking.date);
            eventDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
            if (diffDays !== 1 && diffDays !== 3)
                continue;
            const existing = await this.notificationModel.findOne({
                bookingId: String(booking._id),
                type: 'event-reminder',
                daysBefore: diffDays,
            });
            if (existing)
                continue;
            await this.create({
                userId: booking.customerId,
                vendorId: booking.vendorId,
                bookingId: String(booking._id),
                type: 'event-reminder',
                daysBefore: diffDays,
                message: `Reminder: Event is in ${diffDays} day${diffDays === 1 ? '' : 's'}.`,
            });
        }
    }
    async findAll() {
        return this.notificationModel.find().sort({ createdAt: -1 }).exec();
    }
    async findByUser(userId) {
        return this.notificationModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByVendor(vendorId) {
        return this.notificationModel
            .find({ vendorId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findOne(id) {
        const notification = await this.notificationModel.findById(id).exec();
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        return notification;
    }
    async markAsRead(id) {
        const updated = await this.notificationModel
            .findByIdAndUpdate(id, { read: true }, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Notification not found');
        return updated;
    }
    async update(id, updateNotificationDto) {
        const updated = await this.notificationModel
            .findByIdAndUpdate(id, updateNotificationDto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Notification not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.notificationModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Notification not found');
        return deleted;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        events_gateway_1.EventsGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map