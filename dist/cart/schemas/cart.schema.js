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
exports.CartItemSchema = exports.CartSchema = exports.Cart = exports.CartItem = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CartItem = class CartItem {
    vendorId;
    serviceName;
    serviceId;
    price;
};
exports.CartItem = CartItem;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Vendor', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CartItem.prototype, "vendorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CartItem.prototype, "serviceName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Service' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CartItem.prototype, "serviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CartItem.prototype, "price", void 0);
exports.CartItem = CartItem = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CartItem);
let Cart = class Cart {
    userId;
    eventId;
    items;
    totalAmount;
};
exports.Cart = Cart;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Cart.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Event', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Cart.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [CartItem], required: true }),
    __metadata("design:type", Array)
], Cart.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Cart.prototype, "totalAmount", void 0);
exports.Cart = Cart = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Cart);
exports.CartSchema = mongoose_1.SchemaFactory.createForClass(Cart);
exports.CartItemSchema = mongoose_1.SchemaFactory.createForClass(CartItem);
exports.CartSchema.set('toJSON', { versionKey: false });
//# sourceMappingURL=cart.schema.js.map