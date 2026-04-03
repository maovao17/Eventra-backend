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
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payout_schema_1 = require("./schemas/payout.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
let PayoutService = class PayoutService {
    payoutModel;
    bookingModel;
    constructor(payoutModel, bookingModel) {
        this.payoutModel = payoutModel;
        this.bookingModel = bookingModel;
    }
    async create(createPayoutDto) {
        const createdPayout = new this.payoutModel({
            ...createPayoutDto,
            status: 'pending',
        });
        const saved = await createdPayout.save();
        if (createPayoutDto.bookingId) {
            await this.bookingModel
                .findByIdAndUpdate(createPayoutDto.bookingId, {
                payoutStatus: 'pending',
            })
                .exec();
        }
        return saved;
    }
    async findAll() {
        return this.payoutModel.find().exec();
    }
    async findByVendor(vendorId) {
        return this.payoutModel.find({ vendorId }).exec();
    }
    async findByEvent(eventId) {
        return this.payoutModel.find({ eventId }).exec();
    }
    async findByBooking(bookingId) {
        return this.payoutModel.findOne({ bookingId }).exec();
    }
    async findOne(id) {
        const payout = await this.payoutModel.findById(id).exec();
        if (!payout)
            throw new common_1.NotFoundException('Payout not found');
        return payout;
    }
    async update(id, updatePayoutDto) {
        const updated = await this.payoutModel
            .findByIdAndUpdate(id, updatePayoutDto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Payout not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.payoutModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Payout not found');
        return deleted;
    }
    async markAsPaid(id) {
        const payout = await this.update(id, {
            status: 'paid',
            paidAt: new Date(),
        });
        if (payout.bookingId) {
            await this.bookingModel
                .findByIdAndUpdate(payout.bookingId, { payoutStatus: 'paid' })
                .exec();
        }
        return payout;
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payout_schema_1.Payout.name)),
    __param(1, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PayoutService);
//# sourceMappingURL=payout.service.js.map