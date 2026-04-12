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
exports.RequestSchema = exports.Request = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Request = class Request {
    customerId;
    vendorId;
    eventId;
    status;
    amount;
    packageName;
};
exports.Request = Request;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Request.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Request.prototype, "vendorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Request.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected'],
    }),
    __metadata("design:type", String)
], Request.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Request.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Request.prototype, "packageName", void 0);
exports.Request = Request = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Request);
exports.RequestSchema = mongoose_1.SchemaFactory.createForClass(Request);
exports.RequestSchema.index({ customerId: 1 });
exports.RequestSchema.index({ vendorId: 1 });
exports.RequestSchema.index({ eventId: 1 });
exports.RequestSchema.index({ customerId: 1, vendorId: 1, eventId: 1 });
exports.RequestSchema.set('toJSON', { versionKey: false });
//# sourceMappingURL=request.schema.js.map