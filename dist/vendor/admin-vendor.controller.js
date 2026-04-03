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
exports.AdminVendorController = void 0;
const common_1 = require("@nestjs/common");
const vendor_service_1 = require("./vendor.service");
const firebase_guard_1 = require("../auth/firebase.guard");
const admin_guard_1 = require("../auth/admin.guard");
let AdminVendorController = class AdminVendorController {
    vendorService;
    constructor(vendorService) {
        this.vendorService = vendorService;
    }
    getPendingVendors() {
        return this.vendorService.getPendingVendors();
    }
    approveVendor(id) {
        return this.vendorService.approveVendor(id);
    }
};
exports.AdminVendorController = AdminVendorController;
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminVendorController.prototype, "getPendingVendors", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminVendorController.prototype, "approveVendor", null);
exports.AdminVendorController = AdminVendorController = __decorate([
    (0, common_1.Controller)('admin/vendors'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], AdminVendorController);
//# sourceMappingURL=admin-vendor.controller.js.map