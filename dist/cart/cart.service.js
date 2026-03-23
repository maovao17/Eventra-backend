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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_schema_1 = require("./schemas/cart.schema");
let CartService = class CartService {
    cartModel;
    constructor(cartModel) {
        this.cartModel = cartModel;
    }
    async create(createCartDto) {
        const createdCart = new this.cartModel(createCartDto);
        return createdCart.save();
    }
    async findAll() {
        return this.cartModel.find().exec();
    }
    async findByUserAndEvent(userId, eventId) {
        return this.cartModel.findOne({ userId, eventId }).exec();
    }
    async findByUser(userId) {
        return this.cartModel.find({ userId }).exec();
    }
    async findOne(id) {
        const cart = await this.cartModel.findById(id).exec();
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        return cart;
    }
    async update(id, updateCartDto) {
        const updated = await this.cartModel.findByIdAndUpdate(id, updateCartDto, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Cart not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.cartModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Cart not found');
        return deleted;
    }
    async addItem(userId, eventId, vendorId, serviceId, serviceName, price) {
        let cart = await this.findByUserAndEvent(userId, eventId);
        if (!cart) {
            cart = await this.create({ userId, eventId, items: [], totalAmount: 0 });
        }
        cart.items.push({ vendorId: new mongoose_2.Types.ObjectId(vendorId), serviceId: new mongoose_2.Types.ObjectId(serviceId), serviceName, price });
        cart.totalAmount += price;
        return cart.save();
    }
    async removeItem(cartId, itemIndex) {
        const cart = await this.findOne(cartId);
        if (itemIndex >= 0 && itemIndex < cart.items.length) {
            cart.totalAmount -= cart.items[itemIndex].price;
            cart.items.splice(itemIndex, 1);
            return cart.save();
        }
        throw new common_1.NotFoundException('Item not found');
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CartService);
//# sourceMappingURL=cart.service.js.map