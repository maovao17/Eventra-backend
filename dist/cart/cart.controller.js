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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const cart_service_1 = require("./cart.service");
const create_cart_dto_1 = require("./dto/create-cart.dto");
const update_cart_dto_1 = require("./dto/update-cart.dto");
const firebase_guard_1 = require("../auth/firebase.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    create(req, createCartDto) {
        return this.cartService.create({
            ...createCartDto,
            userId: req.user.role === 'admin' ? createCartDto.userId : req.user.uid,
        });
    }
    findAll(req, userId) {
        if (req.user.role === 'admin') {
            if (userId)
                return this.cartService.findByUser(userId);
            return this.cartService.findAll();
        }
        if (userId && userId !== req.user.uid) {
            throw new common_1.ForbiddenException('You do not have access to this cart');
        }
        if (userId)
            return this.cartService.findByUser(userId);
        return this.cartService.findByUser(req.user.uid);
    }
    async findByUserAndEvent(req, userId, eventId) {
        if (req.user.role !== 'admin' && userId !== req.user.uid) {
            throw new common_1.ForbiddenException('You do not have access to this cart');
        }
        return this.cartService.findByUserAndEvent(userId, eventId);
    }
    async findOne(req, id) {
        const cart = await this.cartService.findOne(id);
        if (req.user.role !== 'admin' &&
            String(cart.userId) !== String(req.user.uid)) {
            throw new common_1.ForbiddenException('You do not have access to this cart');
        }
        return cart;
    }
    async assertCartAccess(req, id) {
        const cart = await this.cartService.findOne(id);
        if (req.user.role !== 'admin' &&
            String(cart.userId) !== String(req.user.uid)) {
            throw new common_1.ForbiddenException('You do not have access to this cart');
        }
        return cart;
    }
    async update(req, id, updateCartDto) {
        await this.assertCartAccess(req, id);
        return this.cartService.update(id, updateCartDto);
    }
    addItem(req, userId, eventId, body) {
        const effectiveUserId = req.user.role === 'admin' ? userId : req.user.uid;
        if (req.user.role !== 'admin' && userId !== req.user.uid) {
            throw new common_1.ForbiddenException('You do not have access to this cart');
        }
        return this.cartService.addItem(effectiveUserId, eventId, body.vendorId, body.serviceId, body.serviceName, body.price);
    }
    async removeItem(req, id, itemIndex) {
        await this.assertCartAccess(req, id);
        return this.cartService.removeItem(id, itemIndex);
    }
    async remove(req, id) {
        await this.assertCartAccess(req, id);
        return this.cartService.remove(id);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_cart_dto_1.CreateCartDto]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Get)('user/:userId/event/:eventId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "findByUserAndEvent", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_cart_dto_1.UpdateCartDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Post)(':userId/:eventId/add'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('eventId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "addItem", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Delete)(':id/item/:itemIndex'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemIndex')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeItem", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "remove", null);
exports.CartController = CartController = __decorate([
    (0, common_1.Controller)('carts'),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map