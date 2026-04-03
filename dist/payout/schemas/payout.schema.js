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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutSchema = exports.Payout = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Payout = class Payout {
    bookingId;
    paymentId;
    vendorId;
    eventId;
    totalEarned;
    commissionCut;
    payoutAmount;
    status;
    paidAt;
};
exports.Payout = Payout;
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Payout.prototype, "bookingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Payout.prototype, "paymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Vendor', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Payout.prototype, "vendorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Event', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Payout.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payout.prototype, "totalEarned", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payout.prototype, "commissionCut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payout.prototype, "payoutAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['pending', 'paid'] }),
    __metadata("design:type", String)
], Payout.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Payout.prototype, "paidAt", void 0);
exports.Payout = Payout = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Payout);
exports.PayoutSchema = mongoose_1.SchemaFactory.createForClass(Payout);
exports.PayoutSchema.set('toJSON', { versionKey: false });
//# sourceMappingURL=payout.schema.js.map