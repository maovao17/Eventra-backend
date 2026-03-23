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
let PayoutService = class PayoutService {
    payoutModel;
    constructor(payoutModel) {
        this.payoutModel = payoutModel;
    }
    async create(createPayoutDto) {
        const createdPayout = new this.payoutModel({
            ...createPayoutDto,
            status: 'pending',
        });
        return createdPayout.save();
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
    async findOne(id) {
        const payout = await this.payoutModel.findById(id).exec();
        if (!payout)
            throw new common_1.NotFoundException('Payout not found');
        return payout;
    }
    async update(id, updatePayoutDto) {
        const updated = await this.payoutModel.findByIdAndUpdate(id, updatePayoutDto, { new: true }).exec();
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
        return this.update(id, { status: 'paid' });
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payout_schema_1.Payout.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PayoutService);
//# sourceMappingURL=payout.service.js.map