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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const firebase_guard_1 = require("../auth/firebase.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const vendor_service_1 = require("../vendor/vendor.service");
let NotificationController = class NotificationController {
    notificationService;
    vendorService;
    constructor(notificationService, vendorService) {
        this.notificationService = notificationService;
        this.vendorService = vendorService;
    }
    async findAll(req, userId, vendorId) {
        if (req.user.role === 'admin') {
            if (userId)
                return this.notificationService.findByUser(userId);
            if (vendorId)
                return this.notificationService.findByVendor(vendorId);
            return this.notificationService.findAll();
        }
        if (req.user.role === 'vendor') {
            try {
                const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
                return this.notificationService.findByVendor(String(vendor._id));
            }
            catch {
                return [];
            }
        }
        return this.notificationService.findByUser(req.user.uid);
    }
    async findOne(req, id) {
        const notification = await this.notificationService.findOne(id);
        if (req.user.role === 'admin') {
            return notification;
        }
        if (req.user.role === 'customer' &&
            String(notification.userId) === String(req.user.uid)) {
            return notification;
        }
        if (req.user.role === 'vendor') {
            const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
            if (String(notification.vendorId) === String(vendor._id)) {
                return notification;
            }
        }
        throw new common_1.ForbiddenException('You do not have access to this notification');
    }
    async markAsRead(req, id) {
        await this.findOne(req, id);
        return this.notificationService.markAsRead(id);
    }
    async update(req, id, updateNotificationDto) {
        await this.findOne(req, id);
        return this.notificationService.update(id, updateNotificationDto);
    }
    async remove(req, id) {
        await this.findOne(req, id);
        return this.notificationService.remove(id);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "remove", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        vendor_service_1.VendorService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map