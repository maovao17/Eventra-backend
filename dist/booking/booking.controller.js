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
exports.BookingController = void 0;
const common_1 = require("@nestjs/common");
const booking_service_1 = require("./booking.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const update_booking_dto_1 = require("./dto/update-booking.dto");
const platform_express_1 = require("@nestjs/platform-express");
const promises_1 = require("fs/promises");
const path_1 = require("path");
let BookingController = class BookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    create(dto) {
        return this.bookingService.create(dto);
    }
    findAll(userId, customerId, vendorId) {
        const effectiveCustomerId = customerId ?? userId;
        if (effectiveCustomerId)
            return this.bookingService.findByUser(effectiveCustomerId);
        if (vendorId)
            return this.bookingService.findByVendor(vendorId);
        return this.bookingService.findAll();
    }
    findOne(id) {
        return this.bookingService.findById(id);
    }
    accept(id, actorUserId) {
        return this.bookingService.accept(id, actorUserId);
    }
    reject(id, actorUserId) {
        return this.bookingService.reject(id, actorUserId);
    }
    complete(id, actorUserId) {
        return this.bookingService.complete(id, actorUserId);
    }
    async uploadProof(id, file, actorUserId, req) {
        if (!file)
            throw new common_1.BadRequestException('file is required');
        const imageUrl = await this.saveUpload(file, req);
        return this.bookingService.uploadCompletionProof(id, imageUrl, actorUserId);
    }
    update(id, dto) {
        return this.bookingService.update(id, dto);
    }
    remove(id) {
        return this.bookingService.remove(id);
    }
    async saveUpload(file, req) {
        const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
        await (0, promises_1.mkdir)(uploadsDir, { recursive: true });
        const ext = file.originalname.includes('.')
            ? `.${file.originalname.split('.').pop()}`
            : '';
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = (0, path_1.join)(uploadsDir, fileName);
        await (0, promises_1.writeFile)(filePath, file.buffer);
        const origin = `${req?.protocol ?? 'http'}://${req?.get?.('host') ?? 'localhost:3002'}`;
        return `${origin}/uploads/${fileName}`;
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('customerId')),
    __param(2, (0, common_1.Query)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('actorUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('actorUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('actorUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/upload-proof'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('actorUserId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "uploadProof", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_booking_dto_1.UpdateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "remove", null);
exports.BookingController = BookingController = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map