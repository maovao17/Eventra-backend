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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vendor_schema_1 = require("./schemas/vendor.schema");
let VendorService = class VendorService {
    vendorModel;
    constructor(vendorModel) {
        this.vendorModel = vendorModel;
    }
    async findByUserId(userId) {
        return this.vendorModel.findOne({ userId }).lean();
    }
    async updateProfile(userId, data) {
        console.log("VendorService: Saving vendor - UID:", userId, "Data:", data);
        const updateData = {
            ...data,
            profileCompleted: true,
            updatedAt: new Date(),
        };
        return this.vendorModel.findOneAndUpdate({ userId }, updateData, { new: true, upsert: true }).lean();
    }
    async findAllCompleted() {
        return this.vendorModel.find({ profileCompleted: true }).lean();
    }
    async getAllVendors() {
        return this.findAllCompleted();
    }
    async approveVendor(id) {
        return this.vendorModel.findByIdAndUpdate(id, { status: 'approved' }, { new: true, upsert: true }).lean();
    }
    async rejectVendor(id) {
        return this.vendorModel.findByIdAndUpdate(id, { status: 'rejected' }, { new: true, upsert: true }).lean();
    }
    async findOne(id) {
        return this.vendorModel.findById(id).lean();
    }
    async findOneOrThrow(id) {
        const vendor = await this.findOne(id);
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor #${id} not found`);
        }
        return vendor;
    }
    async findByUserIdOrThrow(userId) {
        const vendor = await this.findByUserId(userId);
        if (!vendor) {
            throw new common_1.NotFoundException(`Vendor for user #${userId} not found`);
        }
        return vendor;
    }
    async update(id, data) {
        return this.vendorModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VendorService);
//# sourceMappingURL=vendor.service.js.map