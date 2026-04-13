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
const event_schema_1 = require("../event/schemas/event.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
let RequestService = class RequestService {
    requestModel;
    eventModel;
    userModel;
    bookingModel;
    bookingService;
    userService;
    vendorService;
    eventService;
    eventsGateway;
    constructor(requestModel, eventModel, userModel, bookingModel, bookingService, userService, vendorService, eventService, eventsGateway) {
        this.requestModel = requestModel;
        this.eventModel = eventModel;
        this.userModel = userModel;
        this.bookingModel = bookingModel;
        this.bookingService = bookingService;
        this.userService = userService;
        this.vendorService = vendorService;
        this.eventService = eventService;
        this.eventsGateway = eventsGateway;
    }
    async create(createRequestDto) {
        const customerId = createRequestDto.customerId;
        const customer = await this.userService.findByUserId(customerId);
        if (customer.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can create requests');
        }
        const vendor = await this.vendorService.findOne(createRequestDto.vendorId);
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const vendorApproved = vendor.isApproved === true ||
            vendor.status === 'approved';
        if (!vendorApproved) {
            throw new common_1.ForbiddenException('Vendor is not approved');
        }
        const event = await this.eventService.findById(createRequestDto.eventId);
        if (event.customerId !== customerId) {
            throw new common_1.ForbiddenException('Customers can only request vendors for their own events');
        }
        const existingRequest = await this.requestModel
            .findOne({
            customerId,
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
        console.log(`[findByVendorUser] userId=${userId} vendorId=${vendorId}`);
        const requests = await this.findByVendor(vendorId);
        console.log(`[findByVendorUser] found ${requests.length} requests`);
        if (!requests.length) {
            const sample = await this.requestModel.find({}).select('vendorId customerId status').lean().limit(10).exec();
            console.log(`[findByVendorUser] sample requests in DB:`, JSON.stringify(sample));
            return [];
        }
        const eventIds = Array.from(new Set(requests.map((request) => String(request.eventId))));
        const customerIds = Array.from(new Set(requests.map((request) => String(request.customerId))));
        const requestIds = requests.map((request) => String(request._id));
        console.log(`[findByVendorUser] requestIds:`, requestIds);
        const [events, customers, bookings] = await Promise.all([
            this.eventModel.find({ _id: { $in: eventIds } }).lean().exec(),
            this.userModel.find({ userId: { $in: customerIds } }).lean().exec(),
            this.bookingModel
                .find({ requestId: { $in: requestIds } })
                .lean()
                .exec(),
        ]);
        console.log(`[findByVendorUser] found ${bookings.length} bookings for those requests`);
        const eventsById = new Map(events.map((event) => [String(event._id), event]));
        const customersById = new Map(customers.map((customer) => [String(customer.userId), customer]));
        const bookingsByRequestId = new Map(bookings.map((booking) => [String(booking.requestId), booking]));
        const acceptedWithoutBooking = requests.filter((r) => r.status === 'accepted' && !bookingsByRequestId.has(String(r._id)));
        if (acceptedWithoutBooking.length > 0) {
            console.log(`[findByVendorUser] auto-creating ${acceptedWithoutBooking.length} missing bookings`);
            for (const req of acceptedWithoutBooking) {
                try {
                    const booking = await this.bookingService.createFromRequest({
                        requestId: String(req._id),
                        customerId: req.customerId,
                        vendorId: req.vendorId,
                        eventId: req.eventId,
                        amount: Number(req.amount ?? 0),
                        price: Number(req.amount ?? 0),
                    });
                    bookingsByRequestId.set(String(req._id), booking.toObject ? booking.toObject() : booking);
                    console.log(`[findByVendorUser] auto-created booking ${String(booking._id)} for request ${String(req._id)}`);
                }
                catch (e) {
                    console.error(`[findByVendorUser] failed to auto-create booking for request ${String(req._id)}:`, e);
                }
            }
        }
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
            throw new common_1.BadRequestException("Use /accept endpoint");
        }
        if (updateRequestDto.status === 'rejected') {
            throw new common_1.BadRequestException("Use /reject endpoint");
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
        const isApproved = actor.status === 'approved' ||
            vendor.isApproved === true ||
            vendor.status === 'approved';
        if (!isApproved) {
            throw new common_1.ForbiddenException('Vendor account not approved');
        }
    }
    async accept(id, actorUserIdFromToken) {
        const request = await this.findOne(id);
        await this.validateVendorActor(actorUserIdFromToken, request.vendorId);
        if (request.status === 'accepted') {
            const booking = await this.bookingService.findByRequestId(id);
            return { request, booking };
        }
        if (request.status === 'rejected') {
            throw new common_1.BadRequestException('Rejected requests cannot be accepted');
        }
        request.status = 'accepted';
        await request.save();
        const vendor = await this.vendorService.findOne(String(request.vendorId));
        let bookingAmount = Number(request.amount ?? 0);
        if (bookingAmount === 0) {
            const packageName = String(request.packageName ?? '');
            const packages = vendor.packages ?? [];
            const matchedPkg = packages.find((p) => p.name === packageName && Number(p.price) > 0);
            if (matchedPkg) {
                bookingAmount = Number(matchedPkg.price);
                await this.requestModel.findByIdAndUpdate(request._id, { amount: bookingAmount });
            }
            else if (packages.length > 0) {
                const firstPkg = packages.find((p) => Number(p.price) > 0);
                if (firstPkg) {
                    bookingAmount = Number(firstPkg.price);
                    await this.requestModel.findByIdAndUpdate(request._id, { amount: bookingAmount });
                }
            }
        }
        const booking = await this.bookingService.createFromRequest({
            requestId: String(request._id),
            customerId: request.customerId,
            vendorId: request.vendorId,
            eventId: request.eventId,
            ...(bookingAmount > 0 ? { amount: bookingAmount, price: bookingAmount } : {}),
        });
        this.eventsGateway.broadcastBookingUpdate({
            bookingId: String(booking._id),
            status: 'accepted',
            vendorId: booking.vendorId,
            vendorUserId: String(vendor?.userId || ''),
            customerId: booking.customerId,
        });
        return { request, booking };
    }
    async resolveAmount(requestId) {
        const request = await this.findOne(requestId);
        let amount = Number(request.amount ?? 0);
        if (amount > 0)
            return amount;
        const packageName = String(request.packageName ?? '');
        try {
            const vendor = await this.vendorService.findOne(request.vendorId);
            const packages = vendor.packages ?? [];
            const pkg = (packageName && packages.find((p) => p.name === packageName && Number(p.price) > 0)) ||
                packages.find((p) => Number(p.price) > 0);
            if (pkg) {
                amount = Number(pkg.price);
                await this.requestModel.findByIdAndUpdate(request._id, { amount });
            }
        }
        catch { }
        return amount;
    }
    async reject(id, actorUserIdFromToken) {
        const request = await this.findOne(id);
        await this.validateVendorActor(actorUserIdFromToken, request.vendorId);
        if (request.status === 'rejected') {
            throw new common_1.BadRequestException('Rejected requests cannot be accepted');
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
    __param(1, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => booking_service_1.BookingService))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => vendor_service_1.VendorService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        booking_service_1.BookingService,
        user_service_1.UserService,
        vendor_service_1.VendorService,
        event_service_1.EventService,
        events_gateway_1.EventsGateway])
], RequestService);
//# sourceMappingURL=request.service.js.map