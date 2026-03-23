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
exports.PayoutController = void 0;
const common_1 = require("@nestjs/common");
const payout_service_1 = require("./payout.service");
const create_payout_dto_1 = require("./dto/create-payout.dto");
let PayoutController = class PayoutController {
    payoutService;
    constructor(payoutService) {
        this.payoutService = payoutService;
    }
    create(createPayoutDto) {
        return this.payoutService.create(createPayoutDto);
    }
    findAll(vendorId) {
        if (vendorId)
            return this.payoutService.findByVendor(vendorId);
        return this.payoutService.findAll();
    }
    findByEvent(eventId) {
        return this.payoutService.findByEvent(eventId);
    }
    findOne(id) {
        return this.payoutService.findOne(id);
    }
    update(id, updatePayoutDto) {
        return this.payoutService.update(id, updatePayoutDto);
    }
    markAsPaid(id) {
        return this.payoutService.markAsPaid(id);
    }
    remove(id) {
        return this.payoutService.remove(id);
    }
};
exports.PayoutController = PayoutController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payout_dto_1.CreatePayoutDto]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutController.prototype, "remove", null);
exports.PayoutController = PayoutController = __decorate([
    (0, common_1.Controller)('payouts'),
    __metadata("design:paramtypes", [payout_service_1.PayoutService])
], PayoutController);
//# sourceMappingURL=payout.controller.js.map