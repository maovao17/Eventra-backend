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
const review_service_1 = require("../review/review.service");
const booking_service_1 = require("../booking/booking.service");
const notification_service_1 = require("../notification/notification.service");
let VendorService = class VendorService {
    vendorModel;
    reviewService;
    bookingService;
    notificationService;
    constructor(vendorModel, reviewService, bookingService, notificationService) {
        this.vendorModel = vendorModel;
        this.reviewService = reviewService;
        this.bookingService = bookingService;
        this.notificationService = notificationService;
    }
    async findByUserId(userId) {
        return this.vendorModel.findOne({ userId }).lean();
    }
    async updateProfile(userId, data) {
        console.log("VendorService: Saving vendor - UID:", userId, "Data:", data);
        const updateData = {
            ...data,
            profileCompleted: true,
            updatedAt: new Date(),
        };
        return this.vendorModel.findOneAndUpdate({ userId }, updateData, { new: true, upsert: true }).lean();
    }
    async findAllCompleted() {
        return this.vendorModel.find({
            profileCompleted: true,
            $or: [{ status: 'approved' }, { isApproved: true }],
        }).lean();
    }
    async approveVendor(id) {
        return this.vendorModel.findByIdAndUpdate(id, { isApproved: true, isVerified: true, status: 'approved' }, { new: true }).lean();
    }
    async getAllVendors() {
        return this.vendorModel.find().lean();
    }
    async rejectVendor(id) {
        return this.vendorModel.findByIdAndUpdate(id, { status: 'rejected' }, { new: true, upsert: true }).lean();
    }
    async findOne(id) {
        return this.vendorModel.findById(id).lean();
    }
    async findOneOrThrow(id) {
        const vendor = await this.findOne(id);
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor #${id} not found`);
        }
        return vendor;
    }
    async findByUserIdOrThrow(userId) {
        const vendor = await this.findByUserId(userId);
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor for user #${userId} not found`);
        }
        return vendor;
    }
    async update(id, data) {
        try {
            return await this.vendorModel.findByIdAndUpdate(id, data, { new: true });
        }
        catch (e) {
            console.log("Update fallback:", e);
            return {};
        }
    }
    async getVendorReviews(uid) {
        try {
            const vendor = await this.findByUserId(uid);
            if (!vendor?._id)
                return [];
            console.log("UID:", uid, "Vendor:", vendor);
            return await this.reviewService.findByVendor(String(vendor._id));
        }
        catch (e) {
            console.error("getVendorReviews ERROR:", e);
            return [];
        }
    }
    async getVendorBookings(uid) {
        try {
            console.log("UID:", uid);
            const result = await this.bookingService.findByVendorUser(uid);
            console.log("Bookings result:", result);
            return result;
        }
        catch (e) {
            console.error("getVendorBookings ERROR:", e);
            return [];
        }
    }
    async getVendorNotifications(uid) {
        try {
            const vendor = await this.findByUserId(uid);
            if (!vendor?._id)
                return [];
            console.log("UID:", uid, "Vendor:", vendor);
            return await this.notificationService.findByVendor(String(vendor._id));
        }
        catch (e) {
            console.error("getVendorNotifications ERROR:", e);
            return [];
        }
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        review_service_1.ReviewService,
        booking_service_1.BookingService,
        notification_service_1.NotificationService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map