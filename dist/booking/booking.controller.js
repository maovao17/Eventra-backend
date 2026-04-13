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
const update_booking_dto_1 = require("./dto/update-booking.dto");
const platform_express_1 = require("@nestjs/platform-express");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const firebase_guard_1 = require("../auth/firebase.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const VENDOR_ALLOWED_STATUSES = new Set(['accepted', 'rejected', 'completed']);
let BookingController = class BookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async findAll(req, userId, customerId, vendorId, requestId) {
        if (requestId) {
            const booking = await this.bookingService.findByRequestId(requestId);
            if (!booking)
                return [];
            if (req.user.role === 'admin') {
                return [booking];
            }
            if (req.user.role === 'customer') {
                if (String(booking.customerId) !== String(req.user.uid)) {
                    throw new common_1.ForbiddenException('You do not have access to this booking');
                }
                return [booking];
            }
            await this.bookingService.assertVendorOwnership(String(booking._id), req.user.uid);
            return [booking];
        }
        if (req.user.role === 'admin') {
            const effectiveCustomerId = customerId ?? userId;
            if (effectiveCustomerId)
                return this.bookingService.findByUser(effectiveCustomerId);
            if (vendorId)
                return this.bookingService.findByVendor(vendorId);
            return this.bookingService.findAll();
        }
        if (req.user.role === 'customer') {
            return this.bookingService.findByUser(req.user.uid);
        }
        return this.bookingService.findByVendorUser(req.user.uid);
    }
    async findByRequestId(req, requestId) {
        const booking = await this.bookingService.findByRequestId(requestId);
        if (!booking)
            return null;
        if (req.user.role === 'admin') {
            return booking;
        }
        if (req.user.role === 'customer') {
            if (String(booking.customerId) !== String(req.user.uid)) {
                throw new common_1.ForbiddenException('You do not have access to this booking');
            }
            return booking;
        }
        await this.bookingService.assertVendorOwnership(String(booking._id), req.user.uid);
        return booking;
    }
    async findOne(req, id) {
        const booking = await this.bookingService.findById(id);
        if (req.user.role === 'admin') {
            return booking;
        }
        if (req.user.role === 'customer' &&
            String(booking.customerId) === String(req.user.uid)) {
            return booking;
        }
        if (req.user.role === 'vendor') {
            await this.bookingService.assertVendorOwnership(id, req.user.uid);
            return booking;
        }
        throw new common_1.ForbiddenException('You do not have access to this booking');
    }
    accept(req, id) {
        return this.bookingService.accept(id, req.user.uid);
    }
    reject(req, id) {
        return this.bookingService.reject(id, req.user.uid);
    }
    complete(req, id) {
        return this.bookingService.complete(id, req.user.uid);
    }
    async uploadProof(id, file, req) {
        if (!file)
            throw new common_1.BadRequestException('file is required');
        const imageUrl = await this.saveUpload(file, req);
        return this.bookingService.uploadCompletionProof(id, imageUrl, req?.user?.uid);
    }
    async updateStatus(req, id, dto) {
        if (!dto?.status) {
            throw new common_1.BadRequestException('status is required');
        }
        if (req.user.role === 'vendor') {
            if (!VENDOR_ALLOWED_STATUSES.has(dto.status)) {
                throw new common_1.BadRequestException('Vendors can only set status to accepted, rejected, or completed');
            }
            await this.bookingService.assertVendorOwnership(id, req.user.uid);
            if (dto.status === 'accepted') {
                return this.bookingService.accept(id, req.user.uid);
            }
            if (dto.status === 'rejected') {
                return this.bookingService.reject(id, req.user.uid);
            }
            return this.bookingService.complete(id, req.user.uid);
        }
        await this.bookingService.findById(id);
        return this.bookingService.update(id, { status: dto.status });
    }
    async update(id, dto) {
        await this.bookingService.findById(id);
        return this.bookingService.update(id, dto);
    }
    async markPayoutPaid(req, id) {
        await this.bookingService.findById(id);
        return this.bookingService.markPayoutPaid(id, req.user.role);
    }
    async remove(req, id) {
        await this.bookingService.assertVendorOwnership(id, req.user.uid);
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
        const host = req?.get?.('host') || process.env.CORS_ORIGIN || 'localhost:3000';
        const origin = `${req?.protocol ?? 'http'}://${host}`;
        return `${origin}/uploads/${fileName}`;
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('customerId')),
    __param(3, (0, common_1.Query)('vendorId')),
    __param(4, (0, common_1.Query)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)('by-request/:requestId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findByRequestId", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "accept", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "reject", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingController.prototype, "complete", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Post)(':id/upload-proof'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, callback) => {
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
            ];
            if (allowedTypes.includes(file.mimetype)) {
                callback(null, true);
            }
            else {
                callback(new Error('Invalid file type. Only JPG/PNG/WEBP allowed.'), false);
            }
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "uploadProof", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor', 'admin'),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_booking_dto_1.UpdateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Patch)(':id/payout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "markPayoutPaid", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "remove", null);
exports.BookingController = BookingController = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map