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
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("./schemas/review.schema");
const booking_service_1 = require("../booking/booking.service");
const user_service_1 = require("../user/user.service");
const vendor_service_1 = require("../vendor/vendor.service");
let ReviewService = class ReviewService {
    reviewModel;
    bookingService;
    userService;
    vendorService;
    constructor(reviewModel, bookingService, userService, vendorService) {
        this.reviewModel = reviewModel;
        this.bookingService = bookingService;
        this.userService = userService;
        this.vendorService = vendorService;
    }
    async create(dto) {
        const customerId = dto.customerId ?? dto.userId;
        if (!customerId) {
            throw new common_1.BadRequestException('customerId is required');
        }
        const customer = await this.userService.findByUserId(customerId);
        if (customer.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can create reviews');
        }
        const booking = await this.bookingService.findById(dto.bookingId);
        if (booking.customerId !== customerId || booking.vendorId !== dto.vendorId) {
            throw new common_1.ForbiddenException('Review does not match booking ownership');
        }
        if (booking.status !== 'confirmed' && booking.status !== 'completed') {
            throw new common_1.BadRequestException('Reviews are allowed only after confirmed/completed booking');
        }
        const existingReview = await this.reviewModel.findOne({ bookingId: dto.bookingId }).exec();
        if (existingReview) {
            throw new common_1.ConflictException('A review already exists for this booking');
        }
        const review = await this.reviewModel.create({
            ...dto,
            customerId,
        });
        await this.refreshVendorRating(dto.vendorId);
        return review;
    }
    async reply(reviewId, actorUserId, reply) {
        if (!reviewId || !actorUserId || !reply) {
            throw new common_1.BadRequestException('reviewId, actorUserId and reply are required');
        }
        const actor = await this.userService.findByUserId(actorUserId);
        if (actor.role !== 'vendor') {
            throw new common_1.ForbiddenException('Only vendors can reply to reviews');
        }
        const vendor = await this.vendorService.findByUserId(actorUserId);
        if (!vendor) {
            throw new common_1.ForbiddenException('Vendor profile not found');
        }
        const reviewDoc = await this.reviewModel.findById(reviewId).exec();
        if (!reviewDoc) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (String(reviewDoc.vendorId) !== String(vendor._id)) {
            throw new common_1.ForbiddenException('Vendors can only reply to their own reviews');
        }
        reviewDoc.reply = reply;
        reviewDoc.replyBy = actorUserId;
        reviewDoc.repliedAt = new Date();
        await reviewDoc.save();
        return reviewDoc;
    }
    async findAll() {
        return this.reviewModel.find().sort({ createdAt: -1 }).exec();
    }
    async findByVendor(vendorId) {
        return this.reviewModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
    }
    async findByBooking(bookingId) {
        return this.reviewModel.findOne({ bookingId }).exec();
    }
    async refreshVendorRating(vendorId) {
        const reviews = await this.reviewModel.find({ vendorId }).exec();
        if (!reviews.length) {
            await this.vendorService.update(vendorId, { rating: 0 });
            return;
        }
        const avg = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
        await this.vendorService.update(vendorId, { rating: Number(avg.toFixed(2)) });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        booking_service_1.BookingService,
        user_service_1.UserService,
        vendor_service_1.VendorService])
], ReviewService);
//# sourceMappingURL=review.service.js.map