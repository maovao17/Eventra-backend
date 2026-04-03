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
exports.RequestService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const request_schema_1 = require("./schemas/request.schema");
const booking_service_1 = require("../booking/booking.service");
const user_service_1 = require("../user/user.service");
const vendor_service_1 = require("../vendor/vendor.service");
const event_service_1 = require("../event/event.service");
const events_gateway_1 = require("../events/events.gateway");
let RequestService = class RequestService {
    requestModel;
    bookingService;
    userService;
    vendorService;
    eventService;
    eventsGateway;
    constructor(requestModel, bookingService, userService, vendorService, eventService, eventsGateway) {
        this.requestModel = requestModel;
        this.bookingService = bookingService;
        this.userService = userService;
        this.vendorService = vendorService;
        this.eventService = eventService;
        this.eventsGateway = eventsGateway;
    }
    async create(createRequestDto) {
        const customer = await this.userService.findByUserId(createRequestDto.customerId);
        if (customer.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can create requests');
        }
        const vendor = await this.vendorService.findOne(createRequestDto.vendorId);
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const event = await this.eventService.findById(createRequestDto.eventId);
        if (event.customerId !== createRequestDto.customerId) {
            throw new common_1.ForbiddenException('Customers can only request vendors for their own events');
        }
        const existingRequest = await this.requestModel
            .findOne({
            customerId: createRequestDto.customerId,
            vendorId: createRequestDto.vendorId,
            eventId: createRequestDto.eventId,
        })
            .exec();
        if (existingRequest) {
            throw new common_1.ConflictException('A request already exists for this vendor and event');
        }
        const createdRequest = new this.requestModel(createRequestDto);
        return createdRequest.save();
    }
    async findAll() {
        return this.requestModel.find().exec();
    }
    async findByUser(userId) {
        return this.requestModel
            .find({ customerId: userId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByVendor(vendorId) {
        return this.requestModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
    }
    async findByVendorUser(userId) {
        const vendor = await this.vendorService.findByUserIdOrThrow(userId);
        const vendorId = String(vendor._id);
        const requests = await this.findByVendor(vendorId);
        const eventIds = Array.from(new Set(requests.map((request) => String(request.eventId))));
        const customerIds = Array.from(new Set(requests.map((request) => String(request.customerId))));
        const eventEntries = await Promise.all(eventIds.map(async (eventId) => {
            try {
                const event = await this.eventService.findById(eventId);
                return [eventId, event];
            }
            catch {
                return [eventId, null];
            }
        }));
        const customerEntries = await Promise.all(customerIds.map(async (customerId) => {
            try {
                const customer = await this.userService.findByUserId(customerId);
                return [customerId, customer];
            }
            catch {
                return [customerId, null];
            }
        }));
        const bookingEntries = await Promise.all(requests.map(async (request) => [
            String(request._id),
            await this.bookingService.findByRequestId(String(request._id)),
        ]));
        const eventsById = new Map(eventEntries);
        const customersById = new Map(customerEntries);
        const bookingsByRequestId = new Map(bookingEntries);
        return requests.map((request) => ({
            ...request.toObject(),
            event: eventsById.get(String(request.eventId)),
            customer: customersById.get(String(request.customerId)),
            booking: bookingsByRequestId.get(String(request._id)) ?? null,
        }));
    }
    async findByEvent(eventId) {
        return this.requestModel.find({ eventId }).sort({ createdAt: -1 }).exec();
    }
    async findByQuery(filters) {
        const query = {};
        if (filters.customerId)
            query.customerId = filters.customerId;
        if (filters.vendorId)
            query.vendorId = filters.vendorId;
        if (filters.eventId)
            query.eventId = filters.eventId;
        return this.requestModel.find(query).sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const request = await this.requestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        return request;
    }
    async update(id, updateRequestDto) {
        if (updateRequestDto.status === 'accepted') {
            return this.accept(id, updateRequestDto.actorUserId);
        }
        if (updateRequestDto.status === 'rejected') {
            return this.reject(id, updateRequestDto.actorUserId);
        }
        const updatedRequest = await this.requestModel
            .findByIdAndUpdate(id, updateRequestDto, { new: true })
            .exec();
        if (!updatedRequest)
            throw new common_1.NotFoundException('Request not found');
        return updatedRequest;
    }
    async remove(id) {
        const request = await this.requestModel.findByIdAndDelete(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        return request;
    }
    async validateVendorActor(actorUserId, vendorId) {
        if (!actorUserId) {
            throw new common_1.BadRequestException('actorUserId is required');
        }
        const actor = await this.userService.findByUserId(actorUserId);
        if (actor.role !== 'vendor') {
            throw new common_1.ForbiddenException('Only vendors can update request status');
        }
        const vendor = await this.vendorService.findByUserId(actorUserId);
        if (!vendor || String(vendor._id) !== String(vendorId)) {
            throw new common_1.ForbiddenException('Vendors can only update their own requests');
        }
    }
    async accept(id, actorUserId) {
        const request = await this.findOne(id);
        await this.validateVendorActor(actorUserId, request.vendorId);
        if (request.status === 'accepted') {
            const booking = await this.bookingService.findByRequestId(id);
            return { request, booking };
        }
        if (request.status === 'rejected') {
            throw new common_1.BadRequestException('Rejected requests cannot be accepted');
        }
        request.status = 'accepted';
        await request.save();
        const booking = await this.bookingService.createFromRequest({
            requestId: String(request._id),
            customerId: request.customerId,
            vendorId: request.vendorId,
            eventId: request.eventId,
        });
        this.eventsGateway.broadcastBookingUpdate({
            bookingId: String(booking._id),
            status: 'accepted',
            vendorId: booking.vendorId,
            customerId: booking.customerId,
        });
        return { request, booking };
    }
    async reject(id, actorUserId) {
        const request = await this.findOne(id);
        await this.validateVendorActor(actorUserId, request.vendorId);
        if (request.status === 'accepted') {
            throw new common_1.BadRequestException('Accepted requests cannot be rejected');
        }
        request.status = 'rejected';
        await request.save();
        return request;
    }
};
exports.RequestService = RequestService;
exports.RequestService = RequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(request_schema_1.Request.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => booking_service_1.BookingService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        booking_service_1.BookingService,
        user_service_1.UserService,
        vendor_service_1.VendorService,
        event_service_1.EventService,
        events_gateway_1.EventsGateway])
], RequestService);
//# sourceMappingURL=request.service.js.map