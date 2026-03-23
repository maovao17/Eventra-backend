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
    create(createVendorDto) {
        return this.vendorService.create(createVendorDto);
    }
    getMe(req) {
        return this.vendorService.getByUserId(req.user.id);
    }
    updateMe(req, dto) {
        return this.vendorService.updateByUserId(req.user.id, dto);
    }
    updateProfilePatch(req, payload) {
        return this.vendorService.updateByUserId(req.user.id, payload ?? {});
    }
    updateProfile(req, payload) {
        return this.vendorService.updateByUserId(req.user.id, payload);
    }
    async uploadFile(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        this.validateImageFile(file);
        const fullUrl = await this.saveUpload(file, req);
        const relativePath = new URL(fullUrl).pathname;
        return {
            url: relativePath,
            fullUrl,
        };
    }
    getByServices(services) {
        const serviceArray = services.split(',');
        return this.vendorService.findByServices(serviceArray);
    }
    async uploadMultiple(files, req) {
        if (!files?.length) {
            throw new common_1.BadRequestException('At least one file is required');
        }
        if (files.length > 7) {
            throw new common_1.BadRequestException('Maximum 7 images are allowed');
        }
        const uploads = await Promise.all(files.map(async (file) => {
            this.validateImageFile(file);
            const fullUrl = await this.saveUpload(file, req);
            return {
                url: new URL(fullUrl).pathname,
                fullUrl,
            };
        }));
        return uploads;
    }
    async uploadPortfolio(files, body, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('At least one file is required');
        }
        if (files.length > 7) {
            throw new common_1.BadRequestException('Maximum 7 images are allowed');
        }
        const urls = await Promise.all(files.map(async (file) => {
            this.validateImageFile(file);
            return this.saveUpload(file, req);
        }));
        return this.vendorService.addPortfolioItems(req.user.id, urls.map((url) => ({
            url,
            caption: body.caption ?? '',
            category: body.category ?? '',
            uploadedAt: new Date(),
        })));
    }
    assignServices(req, body) {
        return this.vendorService.assignServices(req.user.id, body.serviceIds ?? []);
    }
    updateAvailability(req, body) {
        return this.vendorService.updateAvailability(req.user.id, {
            blockedDates: body.blockedDates,
            workingHours: body.workingHours,
        });
    }
    addPackage(req, body) {
        if (!body.name || body.price === undefined) {
            throw new common_1.BadRequestException('name and price are required');
        }
        return this.vendorService.addPackage(req.user.id, {
            name: body.name,
            price: body.price,
            description: body.description,
            servicesIncluded: body.servicesIncluded ?? [],
        });
    }
    async uploadProfileImage(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('file is required');
        }
        this.validateImageFile(file);
        const imageUrl = await this.saveUpload(file, req);
        return this.vendorService.updateProfileImage(req.user.id, imageUrl);
    }
    async uploadGalleryImage(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('file is required');
        }
        this.validateImageFile(file);
        const imageUrl = await this.saveUpload(file, req);
        return this.vendorService.addGalleryImage(req.user.id, imageUrl);
    }
    findVendorBookings(req, bucket) {
        return this.vendorService.getVendorBookings(req.user.id, bucket);
    }
    updateBookingStatus(req, id, body) {
        if (!body.status) {
            throw new common_1.BadRequestException('status is required');
        }
        return this.vendorService.updateVendorBookingStatus(req.user.id, id, body.status);
    }
    getReviews(req) {
        return this.vendorService.getVendorReviews(req.user.id);
    }
    getNotifications(req) {
        return this.vendorService.getVendorNotifications(req.user.id);
    }
    markNotificationRead(req, id) {
        return this.vendorService.markVendorNotificationRead(req.user.id, id);
    }
    async getDashboard(req) {
        const data = await this.vendorService.getDashboard(req.user.id);
        return data || {
            totalBookings: 0,
            pendingRequests: 0,
            revenue: 0,
            averageRating: 0,
        };
    }
    findAll(userId) {
        if (userId) {
            return this.vendorService.findByUserId(userId);
        }
        return this.vendorService.findAll();
    }
    findOne(id) {
        return this.vendorService.findOne(id);
    }
    update(id, updateVendorDto) {
        return this.vendorService.update(id, updateVendorDto);
    }
    remove(id) {
        return this.vendorService.remove(id);
    }
    async saveUpload(file, req) {
        const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
        await (0, promises_1.mkdir)(uploadsDir, { recursive: true });
        const ext = file.originalname.includes('.')
            ? `.${file.originalname.split('.').pop()}`
            : '';
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = (0, path_1.join)(uploadsDir, fileName);
        if (file.buffer) {
            await (0, promises_1.writeFile)(filePath, file.buffer);
        }
        else if (file.path) {
            return `${req.protocol ?? 'http'}://${req.get?.('host') ?? 'localhost:3002'}/uploads/${file.filename}`;
        }
        else {
            throw new common_1.BadRequestException('Invalid file payload');
        }
        const origin = `${req.protocol ?? 'http'}://${req.get?.('host') ?? 'localhost:3002'}`;
        return `${origin}/uploads/${fileName}`;
    }
    validateImageFile(file) {
        if (!VendorController_1.ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only jpg, jpeg, and png files are allowed');
        }
    }
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vendor_dto_1.CreateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "create", null);
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
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateMe", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateProfilePatch", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('by-services'),
    __param(0, (0, common_1.Query)('services')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getByServices", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 7)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Post)('portfolio'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 7)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadPortfolio", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Post)('services'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "assignServices", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Patch)('availability'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Post)('packages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "addPackage", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Post)('upload-profile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Post)('upload-gallery'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "uploadGalleryImage", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('bucket')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findVendorBookings", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Patch)('bookings/:id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "updateBookingStatus", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "markNotificationRead", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "remove", null);
exports.VendorController = VendorController = VendorController_1 = __decorate([
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map