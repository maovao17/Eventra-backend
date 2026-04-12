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
exports.VendorController = void 0;
const common_1 = require("@nestjs/common");
const update_vendor_dto_1 = require("./dto/update-vendor.dto");
const firebase_guard_1 = require("../auth/firebase.guard");
const vendor_service_1 = require("./vendor.service");
const user_service_1 = require("../user/user.service");
const notification_service_1 = require("../notification/notification.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto_1 = require("crypto");
const cloudinary_service_1 = require("./cloudinary.service");
const memStorage = (0, multer_1.memoryStorage)();
let VendorController = class VendorController {
    vendorService;
    userService;
    notificationService;
    cloudinaryService;
    constructor(vendorService, userService, notificationService, cloudinaryService) {
        this.vendorService = vendorService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.cloudinaryService = cloudinaryService;
    }
    getMe(req) {
        return this.vendorService.findByUserId(req.user.userId);
    }
    updateProfile(req, body) {
        return this.vendorService.updateProfile(req.user.userId, body);
    }
    findAll() {
        return this.vendorService.getAllVendors();
    }
    findApproved() {
        return this.vendorService.findAllCompleted();
    }
    async uploadFile(file) {
        const filename = `${(0, crypto_1.randomUUID)()}`;
        const url = await this.cloudinaryService.uploadBuffer(file.buffer, 'eventra', filename);
        return { fullUrl: url, url };
    }
    async uploadMultiple(files) {
        if (!files || files.length === 0) {
            return { data: [] };
        }
        const urls = await Promise.all(files.map(file => this.cloudinaryService.uploadBuffer(file.buffer, 'eventra', (0, crypto_1.randomUUID)())));
        return { data: urls.map(url => ({ url })) };
    }
    getReviews(req) {
        return this.vendorService.getVendorReviews(req.user.userId);
    }
    getBookings(req) {
        return this.vendorService.getVendorBookings(req.user.userId);
    }
    async getNotifications(req) {
        const vendor = await this.vendorService.findByUserId(req.user.userId);
        if (!vendor)
            return [];
        return this.notificationService.findByVendor(String(vendor._id));
    }
    findOne(id) {
        return this.vendorService.findOne(id);
    }
    async approveVendor(id) {
        const vendor = await this.vendorService.approveVendor(id);
        await this.userService.setVendorStatus(vendor.userId, 'approved');
        return vendor;
    }
    async reject(id) {
        const vendor = await this.vendorService.rejectVendor(id);
        if (vendor && vendor.userId) {
            await this.userService.rejectVendor(vendor.userId).catch(() => null);
        }
        return vendor;
    }
    async updateServices(req, body) {
        return this.vendorService.updateProfile(req.user.userId, {
            servicesOffered: body.servicesOffered,
        });
    }
    async updateAvailability(req, body) {
        return this.vendorService.updateProfile(req.user.userId, body);
    }
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findApproved", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: memStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 7, {
        storage: memStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getReviews", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getBookings", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('approve/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "approveVendor", null);
__decorate([
    (0, common_1.Patch)('reject/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "reject", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Patch)('services'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "updateServices", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Patch)('availability'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "updateAvailability", null);
exports.VendorController = VendorController = __decorate([
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendor_service_1.VendorService,
        user_service_1.UserService,
        notification_service_1.NotificationService,
        cloudinary_service_1.CloudinaryService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map