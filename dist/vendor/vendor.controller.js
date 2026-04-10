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
const platform_express_1 = require("@nestjs/platform-express");
let VendorController = class VendorController {
    vendorService;
    constructor(vendorService) {
        this.vendorService = vendorService;
    }
    getMe(req) {
        return this.vendorService.findByUserId(req.user.userId);
    }
    updateProfile(req, body) {
        console.log("Saving vendor profile - UID:", req.user.userId, "Data:", body);
        return this.vendorService.updateProfile(req.user.userId, body);
    }
    findAll() {
        return this.vendorService.getAllVendors();
    }
    findApproved() {
        return this.vendorService.findAllCompleted();
    }
    findOne(id) {
        return this.vendorService.findOne(id);
    }
    uploadFile(file) {
        return {
            fullUrl: `/uploads/${file.filename}`,
            filename: file.filename
        };
    }
    uploadMultiple(file) {
        return {
            data: [{ url: `/uploads/${file.filename}` }]
        };
    }
    approve(id) {
        return this.vendorService.approveVendor(id);
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
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('files')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.Patch)('approve/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "approve", null);
exports.VendorController = VendorController = __decorate([
    (0, common_1.Controller)('vendors'),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map