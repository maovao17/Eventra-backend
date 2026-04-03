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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vendor_schema_1 = require("./schemas/vendor.schema");
const service_schema_1 = require("../service/schemas/service.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
const request_schema_1 = require("../request/schemas/request.schema");
const review_schema_1 = require("../review/schemas/review.schema");
const notification_schema_1 = require("../notification/schemas/notification.schema");
const user_service_1 = require("../user/user.service");
let VendorService = class VendorService {
    vendorModel;
    serviceModel;
    bookingModel;
    requestModel;
    reviewModel;
    notificationModel;
    userService;
    constructor(vendorModel, serviceModel, bookingModel, requestModel, reviewModel, notificationModel, userService) {
        this.vendorModel = vendorModel;
        this.serviceModel = serviceModel;
        this.bookingModel = bookingModel;
        this.requestModel = requestModel;
        this.reviewModel = reviewModel;
        this.notificationModel = notificationModel;
        this.userService = userService;
    }
    async create(dto) {
        return this.vendorModel.create(dto);
    }
    async findPublic() {
        return this.vendorModel.find().sort({ createdAt: -1 }).exec();
    }
    async findOneOrThrow(id) {
        const vendor = await this.vendorModel.findById(id).exec();
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        return vendor;
    }
    async findByServices(servicesQuery) {
        const serviceTerms = String(servicesQuery || '')
            .split(',')
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);
        const vendors = await this.findPublic();
        if (!serviceTerms.length) {
            return vendors;
        }
        return vendors.filter((vendor) => {
            const categoryTerms = Array.isArray(vendor.category)
                ? vendor.category.map((item) => String(item).toLowerCase())
                : [];
            const legacyServiceTerms = Array.isArray(vendor.services)
                ? vendor.services.map((item) => String(item?.name || '').toLowerCase())
                : [];
            return serviceTerms.some((term) => [...categoryTerms, ...legacyServiceTerms].some((value) => value.includes(term)));
        });
    }
    async getOrCreateVendorProfile(userId) {
        let vendor = await this.vendorModel.findOne({ userId });
        if (!vendor) {
            const user = await this.userService.findByUserId(userId);
            if (user.role !== 'vendor') {
                throw new common_1.ForbiddenException('Only vendors allowed');
            }
            vendor = await this.vendorModel.create({
                userId,
                name: user.name,
                businessName: user.businessName || user.name,
                description: '',
                category: [],
                services: [],
                portfolio: [],
                rating: 0,
            });
        }
        return vendor;
    }
    async getByUserId(userId) {
        const vendor = await this.getOrCreateVendorProfile(userId);
        return this.withDerivedAvailability(vendor);
    }
    async updateByUserId(userId, dto) {
        const vendor = await this.getOrCreateVendorProfile(userId);
        Object.assign(vendor, dto);
        await vendor.save();
        return vendor;
    }
    async addPortfolioItems(userId, urls) {
        const vendor = await this.getOrCreateVendorProfile(userId);
        const existing = Array.isArray(vendor.portfolio) ? vendor.portfolio : [];
        const incoming = urls.map((url) => ({
            url,
            caption: '',
            category: '',
            uploadedAt: new Date(),
        }));
        vendor.portfolio = [...existing, ...incoming];
        vendor.gallery = [
            ...(Array.isArray(vendor.gallery) ? vendor.gallery : []),
            ...urls,
        ];
        await vendor.save();
        return vendor;
    }
    async assignServices(userId, serviceIds) {
        const vendor = await this.getOrCreateVendorProfile(userId);
        vendor.servicesOffered = serviceIds;
        const services = serviceIds.length
            ? await this.serviceModel.find({ _id: { $in: serviceIds } }).exec()
            : [];
        vendor.services = services.map((service) => ({
            name: String(service.name),
            price: Number(service.price ?? 0),
            description: String(service.description ?? ''),
        }));
        await vendor.save();
        return vendor;
    }
    async updateAvailability(userId, payload) {
        const vendor = await this.getOrCreateVendorProfile(userId);
        const bookedDates = await this.getBookedDatesForVendor(String(vendor._id));
        const manuallyBlockedDates = Array.isArray(payload.blockedDates)
            ? payload.blockedDates.map((value) => new Date(value))
            : [];
        const mergedBlockedDates = Array.from(new Set([...manuallyBlockedDates, ...bookedDates].map((value) => new Date(value).toISOString().slice(0, 10)))).map((value) => new Date(value));
        vendor.availability = {
            blockedDates: mergedBlockedDates,
            workingHours: {
                start: payload.workingHours?.start || '09:00',
                end: payload.workingHours?.end || '18:00',
            },
        };
        await vendor.save();
        return this.withDerivedAvailability(vendor);
    }
    async getDashboard(userId) {
        try {
            const vendor = await this.vendorModel.findOne({ userId });
            if (!vendor) {
                return this.emptyDashboard();
            }
            const vendorId = String(vendor?._id);
            const bookings = await this.bookingModel.find({
                vendorId: vendorId || '',
            });
            const pendingRequests = await this.requestModel.countDocuments({
                vendorId,
                status: 'pending',
            });
            const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
            const completedBookings = bookings.filter((b) => b.status === 'completed').length;
            const revenue = bookings.reduce((sum, b) => sum + (b.amount || b.price || 0), 0);
            const now = new Date();
            const monthlyRevenue = bookings
                .filter((b) => {
                const d = new Date(b.createdAt || new Date());
                return (d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear());
            })
                .reduce((sum, b) => sum + (b.amount || b.price || 0), 0);
            return {
                totalBookings: bookings.length,
                pendingRequests,
                pendingBookings,
                completedBookings,
                revenue,
                monthlyRevenue,
                rating: vendor.rating || 0,
            };
        }
        catch {
            return this.emptyDashboard();
        }
    }
    emptyDashboard() {
        return {
            totalBookings: 0,
            pendingRequests: 0,
            pendingBookings: 0,
            completedBookings: 0,
            revenue: 0,
            monthlyRevenue: 0,
            rating: 0,
        };
    }
    async getVendorBookings(userId) {
        const vendor = await this.vendorModel.findOne({ userId });
        if (!vendor)
            throw new common_1.NotFoundException();
        return this.bookingModel.find({ vendorId: vendor._id });
    }
    async updateVendorBookingStatus(userId, bookingId, status) {
        const vendor = await this.vendorModel.findOne({ userId });
        if (!vendor)
            throw new common_1.NotFoundException();
        const booking = await this.bookingModel.findById(bookingId);
        if (!booking)
            throw new common_1.NotFoundException();
        booking.status = status;
        await booking.save();
        return booking;
    }
    async getVendorReviews(userId) {
        const vendor = await this.vendorModel.findOne({ userId });
        return this.reviewModel.find({ vendorId: vendor?._id });
    }
    async getVendorNotifications(userId) {
        const vendor = await this.vendorModel.findOne({ userId });
        return this.notificationModel.find({ vendorId: vendor?._id });
    }
    async markVendorNotificationRead(userId, id) {
        const notif = await this.notificationModel.findById(id);
        if (!notif)
            throw new common_1.NotFoundException();
        notif.read = true;
        await notif.save();
        return notif;
    }
    async findOne(id) {
        return this.vendorModel.findById(id);
    }
    async findByUserIdOrThrow(userId) {
        const vendor = await this.vendorModel.findOne({ userId });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async findByUserId(userId) {
        return this.vendorModel.findOne({ userId });
    }
    async update(vendorId, data) {
        return this.vendorModel.findByIdAndUpdate(vendorId, data, { new: true });
    }
    async findAll() {
        return this.vendorModel.find();
    }
    async getPendingVendors() {
        return this.vendorModel.find({ status: 'pending' });
    }
    async approveVendor(id) {
        return this.vendorModel.findByIdAndUpdate(id, {
            status: 'approved',
            isVerified: true,
            verified: true,
        }, { new: true });
    }
    async rejectVendor(id) {
        return this.vendorModel.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    }
    async getAllVendors() {
        return this.vendorModel.find({});
    }
    async getBookedDatesForVendor(vendorId) {
        const bookings = await this.bookingModel
            .find({
            vendorId,
            status: { $in: ['confirmed', 'completed'] },
        })
            .exec();
        return bookings
            .map((booking) => String(booking.date || booking.eventDetails?.date || ''))
            .filter(Boolean)
            .map((value) => new Date(value))
            .filter((date) => !Number.isNaN(date.getTime()));
    }
    async withDerivedAvailability(vendor) {
        const bookedDates = await this.getBookedDatesForVendor(String(vendor._id));
        const manuallyBlocked = Array.isArray(vendor.availability?.blockedDates)
            ? vendor.availability.blockedDates
            : [];
        const mergedBlocked = Array.from(new Set([...manuallyBlocked, ...bookedDates].map((value) => new Date(value).toISOString().slice(0, 10))));
        const payload = vendor.toObject();
        payload.availability = {
            blockedDates: mergedBlocked,
            bookedDates: bookedDates.map((value) => new Date(value).toISOString().slice(0, 10)),
            workingHours: {
                start: vendor.availability?.workingHours?.start || '09:00',
                end: vendor.availability?.workingHours?.end || '18:00',
            },
        };
        return payload;
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __param(1, (0, mongoose_1.InjectModel)(service_schema_1.Service.name)),
    __param(2, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(3, (0, mongoose_1.InjectModel)(request_schema_1.Request.name)),
    __param(4, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(5, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.UserService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map