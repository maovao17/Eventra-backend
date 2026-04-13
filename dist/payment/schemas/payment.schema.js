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
exports.PaymentSchema = exports.Payment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Payment = class Payment {
    bookingId;
    eventId;
    vendorId;
    customerId;
    requestId;
    amount;
    bookingAmount;
    platformFee;
    commissionAmount;
    vendorPayoutAmount;
    payoutId;
    razorpayPaymentId;
    razorpayOrderId;
    status;
};
exports.Payment = Payment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Payment.prototype, "bookingId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Payment.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Payment.prototype, "vendorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Payment.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Payment.prototype, "requestId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "bookingAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "platformFee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "commissionAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "vendorPayoutAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Payment.prototype, "payoutId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Payment.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Payment.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['paid', 'failed'] }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
exports.Payment = Payment = __decorate([
    (0, mongoose_1.Schema)({ _id: false }),
    (0, mongoose_1.Schema)({ timestamps: true })
], Payment);
exports.PaymentSchema = mongoose_1.SchemaFactory.createForClass(Payment);
exports.PaymentSchema.index({ bookingId: 1 }, { unique: true, partialFilterExpression: { status: 'paid' }, });
exports.PaymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
exports.PaymentSchema.index({ razorpayOrderId: 1 });
exports.PaymentSchema.set('toJSON', { versionKey: false });
//# sourceMappingURL=payment.schema.js.map