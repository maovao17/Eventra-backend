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
const request_service_1 = require("../request/request.service");
const events_gateway_1 = require("../events/events.gateway");
const vendor_schema_1 = require("../vendor/schemas/vendor.schema");
const notification_service_1 = require("../notification/notification.service");
const event_schema_1 = require("../event/schemas/event.schema");
let BookingService = class BookingService {
    bookingModel;
    vendorModel;
    eventModel;
    userService;
    requestService;
    notificationService;
    eventsGateway;
    validTransitions = {
        pending: ['accepted', 'rejected', 'cancelled'],
        accepted: ['confirmed', 'rejected', 'cancelled'],
        rejected: [],
        confirmed: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
    };
    constructor(bookingModel, vendorModel, eventModel, userService, requestService, notificationService, eventsGateway) {
        this.bookingModel = bookingModel;
        this.vendorModel = vendorModel;
        this.eventModel = eventModel;
        this.userService = userService;
        this.requestService = requestService;
        this.notificationService = notificationService;
        this.eventsGateway = eventsGateway;
    }
    normalizeDate(value) {
        if (!value)
            return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime()))
            return null;
        return date;
    }
    areSameDay(dateA, dateB) {
        return (dateA.getFullYear() === dateB.getFullYear() &&
            dateA.getMonth() === dateB.getMonth() &&
            dateA.getDate() === dateB.getDate());
    }
    async isVendorAvailable(vendorId, date) {
        if (!date)
            return true;
        const vendor = await this.vendorModel.findById(vendorId).exec();
        if (!vendor)
            return true;
        const normalizedDate = this.normalizeDate(date);
        if (!normalizedDate)
            return true;
        const blockedDates = Array.isArray(vendor.availability?.blockedDates)
            ? vendor.availability.blockedDates.map((item) => this.normalizeDate(String(item)))
            : [];
        return !blockedDates.some((blocked) => blocked && this.areSameDay(blocked, normalizedDate));
    }
    async reserveVendorDate(vendorId, date) {
        if (!date)
            return;
        const normalizedDate = this.normalizeDate(date);
        if (!normalizedDate)
            return;
        const vendor = await this.vendorModel.findById(vendorId).exec();
        if (!vendor)
            return;
        const dates = Array.isArray(vendor.availability?.blockedDates)
            ? vendor.availability.blockedDates.map((item) => this.normalizeDate(String(item)))
            : [];
        if (dates.some((blocked) => blocked && this.areSameDay(blocked, normalizedDate))) {
            return;
        }
        vendor.availability = vendor.availability || {};
        vendor.availability.blockedDates = [
            ...(Array.isArray(vendor.availability.blockedDates)
                ? vendor.availability.blockedDates
                : []),
            normalizedDate,
        ];
        await vendor.save();
    }
    async create(dto) {
        if (!dto.requestId) {
            throw new common_1.BadRequestException('Booking must be created from an existing request');
        }
        const request = await this.requestService.findOne(dto.requestId);
        if (request.status !== 'accepted') {
            throw new common_1.BadRequestException('Booking can only be created for accepted requests');
        }
        const existingBooking = await this.bookingModel
            .findOne({ requestId: dto.requestId })
            .exec();
        if (existingBooking) {
            return existingBooking;
        }
        const booking = await this.bookingModel.create({
            ...dto,
            amount: dto.amount ?? dto.price ?? 0,
            price: dto.price ?? dto.amount ?? 0,
            status: dto.status ?? 'pending',
            paymentStatus: 'pending',
            payoutStatus: 'pending',
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
        const existingBooking = await this.bookingModel
            .findOne({ requestId: dto.requestId })
            .exec();
        if (existingBooking) {
            return existingBooking;
        }
        const [vendor, event] = await Promise.all([
            this.vendorModel.findById(dto.vendorId).exec(),
            this.eventModel.findById(dto.eventId).exec(),
        ]);
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const eventDate = dto.date ??
            event?.eventDate ??
            (event?.date ? new Date(event.date).toISOString() : '');
        if (!(await this.isVendorAvailable(dto.vendorId, eventDate))) {
            throw new common_1.BadRequestException('Vendor is unavailable for the selected date. Please choose another date or vendor.');
        }
        const booking = await this.create({
            ...dto,
            amount: dto.amount ?? vendor.price ?? 0,
            price: dto.price ?? vendor.price ?? 0,
            date: eventDate,
            location: dto.location ??
                String(event?.location?.label ?? event?.location?.address ?? ''),
            eventType: dto.eventType ?? event?.eventType ?? '',
            guests: dto.guests ?? Number(event?.guestCount ?? 0),
            status: 'accepted',
        });
        await this.reserveVendorDate(dto.vendorId, booking.date);
        await this.notificationService.create({
            userId: dto.customerId,
            type: 'new-booking-request',
            message: 'Your vendor request was accepted. Complete payment to confirm booking.',
            bookingId: String(booking._id),
        });
        await this.notificationService.create({
            vendorId: dto.vendorId,
            type: 'new-booking-request',
            message: 'New booking request is awaiting your response.',
            bookingId: String(booking._id),
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
        return this.bookingModel
            .find({ customerId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByVendor(vendorId) {
        return this.bookingModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
    }
    async findByVendorUser(actorUserId) {
        const vendor = await this.vendorModel
            .findOne({ userId: actorUserId })
            .exec();
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        return this.findByVendor(String(vendor._id));
    }
    async findByRequestId(requestId) {
        return this.bookingModel.findOne({ requestId }).exec();
    }
    async assertVendorOwnership(id, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        return booking;
    }
    async update(id, dto) {
        const updated = await this.bookingModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Booking not found');
        return updated;
    }
    async accept(id, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        if (booking.status === 'accepted') {
            return booking;
        }
        if (booking.status === 'rejected' || booking.status === 'cancelled') {
            throw new common_1.BadRequestException('Rejected/cancelled bookings cannot be accepted');
        }
        const newStatus = 'accepted';
        const currentStatus = booking.status;
        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
            return booking;
        }
        if (!(await this.isVendorAvailable(booking.vendorId, booking.date))) {
            throw new common_1.BadRequestException('Vendor is unavailable for the selected date. Please choose another date or vendor.');
        }
        booking.status = newStatus;
        await booking.save();
        await this.reserveVendorDate(booking.vendorId, booking.date);
        await this.notificationService.create({
            userId: booking.customerId,
            type: 'booking-accepted',
            message: 'Your booking request has been accepted by the vendor.',
            bookingId: String(booking._id),
        });
        this.eventsGateway.broadcastBookingUpdate({
            bookingId: String(booking._id),
            status: 'accepted',
            vendorId: booking.vendorId,
            customerId: booking.customerId,
        });
        return booking;
    }
    async reject(id, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        if (booking.status === 'rejected') {
            return booking;
        }
        if (booking.status === 'confirmed' || booking.status === 'completed') {
            throw new common_1.BadRequestException('Confirmed/completed bookings cannot be rejected');
        }
        const newStatus = 'rejected';
        const currentStatus = booking.status;
        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
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
        if (booking.status !== 'confirmed') {
            throw new common_1.BadRequestException('Only confirmed bookings can be completed');
        }
        const newStatus = 'completed';
        const currentStatus = booking.status;
        if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
            return booking;
        }
        booking.status = newStatus;
        await booking.save();
        await this.notificationService.create({
            userId: booking.customerId,
            type: 'booking-completed',
            message: 'Your event service is marked as completed. You can now leave a review.',
            bookingId: String(booking._id),
        });
        this.eventsGateway.broadcastBookingUpdate({
            bookingId: String(booking._id),
            status: 'completed',
            vendorId: booking.vendorId,
            customerId: booking.customerId,
        });
        return booking;
    }
    async uploadCompletionProof(id, imageUrl, actorUserId) {
        const booking = await this.findById(id);
        await this.validateVendorActor(actorUserId, booking.vendorId);
        booking.completionImages = booking.completionImages ?? [];
        booking.completionImages.push(imageUrl);
        await booking.save();
        await this.notificationService.create({
            userId: booking.customerId,
            vendorId: booking.vendorId,
            bookingId: String(booking._id),
            type: 'proof-uploaded',
            message: 'Your vendor has uploaded service completion proof for your event.',
        });
        return booking;
    }
    async markPayoutPaid(id) {
        return this.bookingModel.findByIdAndUpdate(id, { payoutStatus: 'paid' }, { new: true });
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
        const vendor = await this.vendorModel
            .findOne({ userId: actorUserId })
            .exec();
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
    __param(2, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.UserService,
        request_service_1.RequestService,
        notification_service_1.NotificationService,
        events_gateway_1.EventsGateway])
], BookingService);
//# sourceMappingURL=booking.service.js.map