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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const vendor_schema_1 = require("../vendor/schemas/vendor.schema");
const booking_schema_1 = require("../booking/schemas/booking.schema");
const request_schema_1 = require("../request/schemas/request.schema");
let UserService = class UserService {
    userModel;
    vendorModel;
    bookingModel;
    requestModel;
    constructor(userModel, vendorModel, bookingModel, requestModel) {
        this.userModel = userModel;
        this.vendorModel = vendorModel;
        this.bookingModel = bookingModel;
        this.requestModel = requestModel;
    }
    getAdminEmail() {
        return process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';
    }
    isAdminEmail(email) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const adminEmail = this.getAdminEmail();
        return Boolean(adminEmail) && normalizedEmail === adminEmail;
    }
    resolvePersistedRole(role, email) {
        if (this.isAdminEmail(email)) {
            return 'admin';
        }
        return role === 'vendor' ? 'vendor' : 'customer';
    }
    sanitize(doc) {
        if (!doc)
            throw new common_1.NotFoundException('User not found');
        const obj = doc.toObject
            ? doc.toObject()
            : doc;
        return obj;
    }
    async create(dto) {
        try {
            dto.email = dto.email?.trim().toLowerCase();
            if (dto.authProvider === 'google') {
                if (!dto.email) {
                    throw new common_1.BadRequestException('email is required for Google users');
                }
                dto.phoneNumber = undefined;
            }
            if (dto.authProvider === 'phone') {
                if (!dto.phoneNumber) {
                    throw new common_1.BadRequestException('phoneNumber is required for phone users');
                }
            }
            if (dto.role !== 'customer' && dto.role !== 'vendor') {
                throw new common_1.BadRequestException('role must be customer or vendor');
            }
            const persistedRole = this.resolvePersistedRole(dto.role, dto.email);
            const existingUser = await this.userModel
                .findOne({ userId: dto.userId })
                .exec();
            if (existingUser) {
                existingUser.name = dto.name;
                existingUser.phoneNumber = dto.phoneNumber;
                existingUser.email = dto.email?.toLowerCase();
                existingUser.authProvider = dto.authProvider;
                existingUser.role = persistedRole;
                existingUser.businessName = dto.businessName;
                existingUser.profile_photo = dto.profile_photo;
                existingUser.status = persistedRole === 'vendor' ? 'pending' : 'approved';
                await existingUser.save();
                return this.sanitize(existingUser);
            }
            if (dto.email) {
                const existingEmailUser = await this.userModel
                    .findOne({ email: dto.email.toLowerCase() })
                    .exec();
                if (existingEmailUser) {
                    throw new common_1.ConflictException('Email already exists.');
                }
            }
            if (dto.phoneNumber) {
                const existingPhoneUser = await this.userModel
                    .findOne({ phoneNumber: dto.phoneNumber })
                    .exec();
                if (existingPhoneUser) {
                    throw new common_1.ConflictException('Phone number already exists.');
                }
            }
            const createUser = await this.userModel.create({
                ...dto,
                role: persistedRole,
                status: persistedRole === 'vendor' ? 'pending' : 'approved',
            });
            return this.sanitize(createUser);
        }
        catch (err) {
            if (err?.code === 11000) {
                throw new common_1.ConflictException(`User already exists.`);
            }
            if (err?.name === 'ValidationError') {
                throw new common_1.BadRequestException(err.message);
            }
            throw err;
        }
    }
    async findAll(limit = 20, offset = 0, filters = {}) {
        const users = await this.userModel
            .find(filters)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
        return users.map((u) => this.sanitize(u));
    }
    async findById(id) {
        if (!(0, mongoose_2.isValidObjectId)(id))
            throw new common_1.NotFoundException('User not found');
        const userbyId = await this.userModel.findById(id).exec();
        if (!userbyId)
            throw new common_1.NotFoundException('User not found');
        return this.sanitize(userbyId);
    }
    async findByPhone(phone_number) {
        return this.userModel.findOne({ phoneNumber: phone_number }).exec();
    }
    async findByUserId(userId) {
        const user = await this.userModel.findOne({ userId }).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.sanitize(user);
    }
    async assertVendorCanAccessUser(vendorUserId, targetUserId) {
        if (vendorUserId === targetUserId) {
            return this.findByUserId(targetUserId);
        }
        const vendor = await this.vendorModel.findOne({ userId: vendorUserId }).exec();
        if (!vendor) {
            throw new common_1.ForbiddenException('Vendor profile not found');
        }
        const [bookingRelationship, requestRelationship] = await Promise.all([
            this.bookingModel
                .exists({
                vendorId: String(vendor._id),
                customerId: targetUserId,
            })
                .exec(),
            this.requestModel
                .exists({
                vendorId: String(vendor._id),
                customerId: targetUserId,
            })
                .exec(),
        ]);
        if (!bookingRelationship && !requestRelationship) {
            throw new common_1.ForbiddenException('Vendors can only access users linked to their bookings or requests');
        }
        return this.findByUserId(targetUserId);
    }
    async update(id, dto) {
        if (!(0, mongoose_2.isValidObjectId)(id))
            throw new common_1.NotFoundException('User not found');
        try {
            const updateUser = await this.userModel
                .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
                .exec();
            if (!updateUser)
                throw new common_1.NotFoundException('User not found');
            return this.sanitize(updateUser);
        }
        catch (err) {
            const error = err;
            if (error.code === 11000) {
                throw new common_1.ConflictException(`User already exists.`);
            }
            if (error.name === 'ValidationError') {
                throw new common_1.BadRequestException(error.message || 'Invalid user update');
            }
            throw err;
        }
    }
    async remove(id) {
        if (!(0, mongoose_2.isValidObjectId)(id))
            throw new common_1.NotFoundException('User not found');
        const deleteUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deleteUser)
            throw new common_1.NotFoundException('User not found');
        return this.sanitize(deleteUser);
    }
    async approveVendor(userId) {
        return this.setVendorStatus(userId, 'approved');
    }
    async rejectVendor(userId) {
        return this.setVendorStatus(userId, 'rejected');
    }
    async setVendorStatus(userId, status) {
        const user = await this.userModel.findOne({ userId }).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role !== 'vendor')
            throw new common_1.BadRequestException('User is not a vendor');
        if (status === 'approved' && user.status !== 'pending') {
            throw new common_1.BadRequestException('Vendor is not pending approval');
        }
        user.status = status;
        await user.save();
        await this.vendorModel
            .findOneAndUpdate({ userId }, {
            status,
            isVerified: status === 'approved',
            verified: status === 'approved',
        }, { new: true })
            .exec();
        return this.sanitize(user);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(vendor_schema_1.Vendor.name)),
    __param(2, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(3, (0, mongoose_1.InjectModel)(request_schema_1.Request.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], UserService);
//# sourceMappingURL=user.service.js.map