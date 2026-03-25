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
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_schema_1 = require("./schemas/booking.schema");
const user_service_1 = require("../user/user.service");
const vendor_schema_1 = require("../vendor/schemas/vendor.schema");
const notification_service_1 = require("../notification/notification.service");
let BookingService = class BookingService {
    bookingModel;
    vendorModel;
    userService;
    notificationService;
    validTransitions = {
        pending: ["accepted", "cancelled"],
        accepted: ["confirmed", "cancelled"],
        confirmed: ["completed"],
        completed: [],
        cancelled: [],
    };
    constructor(bookingModel, vendorModel, userService, notificationService) {
        this.bookingModel = bookingModel;
        this.vendorModel = vendorModel;
        this.userService = userService;
        this.notificationService = notificationService;
    }
    async create(dto) {
        const booking = await this.bookingModel.create({
            ...dto,
            amount: dto.amount ?? dto.price ?? 0,
            price: dto.price ?? dto.amount ?? 0,
            status: 'pending',
            paymentStatus: 'pending',
            eventDetails: {
                type: dto.eventType ?? '',
                date: dto.date ?? '',
                time: dto.time ?? '',
                location: dto.location ?? '',
                guests: Number(dto.guests ?? 0),
            },
            completionImages: [],
        });
        return booking;
    }
    async createFromRequest(dto) {
        const existingBooking = await this.bookingModel.findOne({ requestId: dto.requestId }).exec();
        if (existingBooking) {
            return existingBooking;
        }
        const booking = await this.create({ ...dto, status: 'pending' });
        await this.notificationService.create({
            userId: dto.customerId,
            type: 'new-booking-request',
            message: 'Your vendor request was accepted. Complete payment to confirm booking.',
        });
        await this.notificationService.create({
            vendorId: dto.vendorId,
            type: 'new-booking-request',
            message: 'New booking request is awaiting your response.',
        });
        return booking;
    }
    async findAll() {
        return this.bookingModel.find().exec();
    }
    async findById(id) {
        const value = await this.bookingModel.findById(id).exec();
        if (!value)
            throw new common_1.NotFoundException('Booking not found');
        return value;
    }
    async findByUser(customerId) {
        return this.bookingModel.find({ customerId }).sort({ createdAt: -1 }).exec();
    }
    async findByVendor(vendorId) {
        return this.bookingModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
    }
    async findByRequestId(requestId) {
        return this.bookingModel.findOne({ requestId }).exec();
    }
    async update(id, dto) {
        const updated = await this.bookingModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Booking not found');
        return updated;
    }
    async accept(id, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        if (booking.status === 'rejected' || booking.status === 'cancelled') {
            throw new common_1.BadRequestException('Rejected/cancelled bookings cannot be accepted');
        }
        const newStatus = 'accepted';
        const currentStatus = booking.status;
        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
            console.warn("Invalid transition:", currentStatus, "→", newStatus);
            return booking;
        }
        booking.status = newStatus;
        await booking.save();
        await this.notificationService.create({
            userId: booking.customerId,
            type: 'booking-accepted',
            message: 'Your booking request has been accepted by the vendor.',
        });
        return booking;
    }
    async reject(id, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        if (booking.status === 'confirmed' || booking.status === 'completed') {
            throw new common_1.BadRequestException('Confirmed/completed bookings cannot be rejected');
        }
        const newStatus = 'rejected';
        const currentStatus = booking.status;
        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
            console.warn("Invalid transition:", currentStatus, "→", newStatus);
            return booking;
        }
        booking.status = newStatus;
        await booking.save();
        await this.notificationService.create({
            userId: booking.customerId,
            type: 'booking-rejected',
            message: 'Your booking request was rejected by the vendor.',
        });
        return booking;
    }
    async complete(id, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        if (booking.status !== 'confirmed' && booking.status !== 'accepted') {
            throw new common_1.BadRequestException('Only accepted/confirmed bookings can be completed');
        }
        const newStatus = 'completed';
        const currentStatus = booking.status;
        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
            console.warn("Invalid transition:", currentStatus, "→", newStatus);
            return booking;
        }
        booking.status = newStatus;
        await booking.save();
        await this.notificationService.create({
            userId: booking.customerId,
            type: 'booking-completed',
            message: 'Your event service is marked as completed. You can now leave a review.',
        });
        return booking;
    }
    async uploadCompletionProof(id, imageUrl, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        booking.completionImages = booking.completionImages ?? [];
        booking.completionImages.push(imageUrl);
        await booking.save();
        return booking;
    }
    async markPayoutPaid(id) {
        return this.bookingModel.findByIdAndUpdate(id, { payoutStatus: "paid" }, { new: true });
    }
    async remove(id) {
        const deleted = await this.bookingModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Booking not found');
        return deleted;
    }
    async validateVendorActor(actorUserId, vendorId) {
        if (!actorUserId) {
            throw new common_1.BadRequestException('actorUserId is required');
        }
        const actor = await this.userService.findByUserId(actorUserId);
        if (actor.role !== 'vendor') {
            throw new common_1.ForbiddenException('Only vendors can update booking status');
        }
        const vendor = await this.vendorModel.findOne({ userId: actorUserId }).exec();
        if (!vendor || String(vendor._id) !== String(vendorId)) {
            throw new common_1.ForbiddenException('Vendors can only manage their own bookings');
        }
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(1, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.UserService,
        notification_service_1.NotificationService])
], BookingService);
//# sourceMappingURL=booking.service.js.map