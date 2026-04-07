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
var VendorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorController = void 0;
const common_1 = require("@nestjs/common");
const vendor_service_1 = require("./vendor.service");
const create_vendor_dto_1 = require("./dto/create-vendor.dto");
const update_vendor_dto_1 = require("./dto/update-vendor.dto");
const platform_express_1 = require("@nestjs/platform-express");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const firebase_guard_1 = require("../auth/firebase.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let VendorController = class VendorController {
    static { VendorController_1 = this; }
    vendorService;
    constructor(vendorService) {
        this.vendorService = vendorService;
    }
    static ALLOWED_IMAGE_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
    ];
    async create(req, dto) {
        if (req.user.role === 'vendor') {
            const user = await this.vendorService.getApprovedVendorUserOrThrow(req.user.userId);
            if (user.status !== 'approved') {
                throw new common_1.BadRequestException('Vendor account not approved');
            }
        }
        return this.vendorService.create({
            ...dto,
            userId: req.user.role === 'admin' ? dto.userId : req.user.userId,
        });
    }
    findAll() {
        return this.vendorService.findPublic();
    }
    findByServices(services) {
        return this.vendorService.findByServices(services);
    }
    getMe(req) {
        return this.vendorService.getByUserId(req.user.userId);
    }
    updateMe(req, dto) {
        return this.vendorService.updateByUserId(req.user.userId, dto);
    }
    updateProfilePatch(req, payload) {
        return this.vendorService.updateByUserId(req.user.userId, payload ?? {});
    }
    updateProfile(req, payload) {
        return this.vendorService.updateByUserId(req.user.userId, payload);
    }
    async getDashboard(req) {
        const data = await this.vendorService.getDashboard(req.user.userId);
        return (data || {
            totalBookings: 0,
            pendingRequests: 0,
            pendingBookings: 0,
            completedBookings: 0,
            revenue: 0,
            monthlyRevenue: 0,
            rating: 0,
        });
    }
    async uploadFile(file, req) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        this.validateImageFile(file);
        const fullUrl = await this.saveUpload(file, req);
        return {
            url: new URL(fullUrl).pathname,
            fullUrl,
        };
    }
    async uploadMultiple(files, req) {
        if (!files?.length)
            throw new common_1.BadRequestException('Files are required');
        const uploaded = [];
        for (const file of files) {
            this.validateImageFile(file);
            const fullUrl = await this.saveUpload(file, req);
            uploaded.push({
                url: new URL(fullUrl).pathname,
                fullUrl,
            });
        }
        return uploaded;
    }
    async uploadPortfolio(files, req) {
        if (!files?.length)
            throw new common_1.BadRequestException('Files are required');
        const urls = [];
        for (const file of files) {
            this.validateImageFile(file);
            const fullUrl = await this.saveUpload(file, req);
            urls.push(new URL(fullUrl).pathname);
        }
        return this.vendorService.addPortfolioItems(req.user.uid, urls);
    }
    assignServices(req, body) {
        return this.vendorService.assignServices(req.user.uid, Array.isArray(body?.serviceIds) ? body.serviceIds : []);
    }
    updateAvailability(req, body) {
        return this.vendorService.updateAvailability(req.user.uid, body ?? {});
    }
    findVendorBookings(req) {
        return this.vendorService.getVendorBookings(req.user.uid);
    }
    updateBookingStatus(req, id, body) {
        return this.vendorService.updateVendorBookingStatus(req.user.uid, id, body.status);
    }
    getReviews(req) {
        return this.vendorService.getVendorReviews(req.user.uid);
    }
    getNotifications(req) {
        return this.vendorService.getVendorNotifications(req.user.uid);
    }
    markNotificationRead(req, id) {
        return this.vendorService.markVendorNotificationRead(req.user.uid, id);
    }
    findOne(id) {
        return this.vendorService.findOneOrThrow(id);
    }
    async saveUpload(file, req) {
        const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
        await (0, promises_1.mkdir)(uploadsDir, { recursive: true });
        const fileName = `${Date.now()}-${Math.random()}.jpg`;
        const filePath = (0, path_1.join)(uploadsDir, fileName);
        await (0, promises_1.writeFile)(filePath, file.buffer);
        return `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    }
    validateImageFile(file) {
        if (!VendorController_1.ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type');
        }
    }
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_vendor_dto_1.CreateVendorDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-services'),
    __param(0, (0, common_1.Query)('services')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findByServices", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateMe", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateProfilePatch", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 7)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Post)('portfolio'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 7)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadPortfolio", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Post)('services'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "assignServices", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Patch)('availability'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findVendorBookings", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Patch)('bookings/:id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateBookingStatus", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getReviews", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "markNotificationRead", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findOne", null);
exports.VendorController = VendorController = VendorController_1 = __decorate([
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map