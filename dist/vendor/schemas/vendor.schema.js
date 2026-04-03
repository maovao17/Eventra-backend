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
exports.VendorSchema = exports.Vendor = exports.VendorBankDetails = exports.VendorLocation = exports.VendorAvailability = exports.VendorWorkingHours = exports.VendorPortfolioItem = exports.VendorServiceItem = exports.VendorPackage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
class VendorPackage {
    name;
    price;
    description;
    servicesIncluded;
}
exports.VendorPackage = VendorPackage;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], VendorPackage.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], VendorPackage.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], VendorPackage.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], VendorPackage.prototype, "servicesIncluded", void 0);
class VendorServiceItem {
    name;
    price;
    description;
}
exports.VendorServiceItem = VendorServiceItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], VendorServiceItem.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0, min: 0 }),
    __metadata("design:type", Number)
], VendorServiceItem.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorServiceItem.prototype, "description", void 0);
class VendorPortfolioItem {
    url;
    caption;
    category;
    uploadedAt;
}
exports.VendorPortfolioItem = VendorPortfolioItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], VendorPortfolioItem.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorPortfolioItem.prototype, "caption", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorPortfolioItem.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: () => new Date() }),
    __metadata("design:type", Date)
], VendorPortfolioItem.prototype, "uploadedAt", void 0);
class VendorWorkingHours {
    start;
    end;
}
exports.VendorWorkingHours = VendorWorkingHours;
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '09:00' }),
    __metadata("design:type", String)
], VendorWorkingHours.prototype, "start", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '18:00' }),
    __metadata("design:type", String)
], VendorWorkingHours.prototype, "end", void 0);
class VendorAvailability {
    blockedDates;
    workingHours;
}
exports.VendorAvailability = VendorAvailability;
__decorate([
    (0, mongoose_1.Prop)({ type: [Date], default: [] }),
    __metadata("design:type", Array)
], VendorAvailability.prototype, "blockedDates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: VendorWorkingHours, default: {} }),
    __metadata("design:type", VendorWorkingHours)
], VendorAvailability.prototype, "workingHours", void 0);
class VendorLocation {
    city;
    area;
    address;
}
exports.VendorLocation = VendorLocation;
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorLocation.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorLocation.prototype, "area", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorLocation.prototype, "address", void 0);
class VendorBankDetails {
    accountHolder;
    accountNumber;
    ifsc;
    bankName;
}
exports.VendorBankDetails = VendorBankDetails;
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorBankDetails.prototype, "accountHolder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorBankDetails.prototype, "accountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorBankDetails.prototype, "ifsc", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], VendorBankDetails.prototype, "bankName", void 0);
let Vendor = class Vendor {
    userId;
    _id;
    name;
    email;
    phone;
    businessType;
    description;
    category;
    servicesOffered;
    location;
    portfolio;
    availability;
    kycDocs;
    isVerified;
    rating;
    totalReviews;
    price;
    image;
    responseTime;
    businessName;
    experience;
    profileImage;
    coverImage;
    services;
    packages;
    gallery;
    reviews;
    verified;
    status;
    bankDetails;
};
exports.Vendor = Vendor;
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], Vendor.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Vendor.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: false,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Vendor.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, unique: true, sparse: true, trim: true }),
    __metadata("design:type", String)
], Vendor.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Vendor.prototype, "businessType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '', trim: true }),
    __metadata("design:type", String)
], Vendor.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Vendor.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Service' }],
        default: [],
    }),
    __metadata("design:type", Array)
], Vendor.prototype, "servicesOffered", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: VendorLocation, default: {} }),
    __metadata("design:type", VendorLocation)
], Vendor.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [VendorPortfolioItem], default: [] }),
    __metadata("design:type", Array)
], Vendor.prototype, "portfolio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: VendorAvailability, default: {} }),
    __metadata("design:type", VendorAvailability)
], Vendor.prototype, "availability", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Vendor.prototype, "kycDocs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "totalReviews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", Number)
], Vendor.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Vendor.prototype, "image", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '1 hour' }),
    __metadata("design:type", String)
], Vendor.prototype, "responseTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Vendor.prototype, "businessName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Vendor.prototype, "experience", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Vendor.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: '' }),
    __metadata("design:type", String)
], Vendor.prototype, "coverImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [VendorServiceItem], default: [] }),
    __metadata("design:type", Array)
], Vendor.prototype, "services", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [VendorPackage], default: [] }),
    __metadata("design:type", Array)
], Vendor.prototype, "packages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Vendor.prototype, "gallery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], Vendor.prototype, "reviews", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "verified", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        index: true,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected'],
    }),
    __metadata("design:type", String)
], Vendor.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: VendorBankDetails, default: {} }),
    __metadata("design:type", VendorBankDetails)
], Vendor.prototype, "bankDetails", void 0);
exports.Vendor = Vendor = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Vendor);
exports.VendorSchema = mongoose_1.SchemaFactory.createForClass(Vendor);
exports.VendorSchema.set('toJSON', { versionKey: false });
//# sourceMappingURL=vendor.schema.js.map