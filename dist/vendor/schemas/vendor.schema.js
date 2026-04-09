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
exports.VendorSchema = exports.Vendor = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Vendor = class Vendor {
    userId;
    businessName;
    description;
    category;
    location;
    experience;
    profileImage;
    portfolio;
    profileCompleted;
    packages;
};
exports.Vendor = Vendor;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Vendor.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Vendor.prototype, "businessName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Vendor.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], Vendor.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Object)
], Vendor.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Vendor.prototype, "experience", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Vendor.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ url: String, caption: String }]),
    __metadata("design:type", Array)
], Vendor.prototype, "portfolio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "profileCompleted", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], Vendor.prototype, "packages", void 0);
exports.Vendor = Vendor = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Vendor);
exports.VendorSchema = mongoose_1.SchemaFactory.createForClass(Vendor);
//# sourceMappingURL=vendor.schema.js.map