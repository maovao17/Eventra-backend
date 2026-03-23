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
let UserService = class UserService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    sanitize(doc) {
        if (!doc)
            return doc;
        const obj = doc.toObject ? doc.toObject() : doc;
        return obj;
    }
    async create(dto) {
        try {
            const existingUser = await this.userModel.findOne({ userId: dto.userId }).exec();
            if (existingUser) {
                existingUser.name = dto.name;
                existingUser.phoneNumber = dto.phoneNumber;
                existingUser.role = dto.role;
                existingUser.businessName = dto.businessName;
                existingUser.profile_photo = dto.profile_photo;
                await existingUser.save();
                return this.sanitize(existingUser);
            }
            const createUser = await this.userModel.create(dto);
            return this.sanitize(createUser);
        }
        catch (err) {
            if (err?.code === 11000) {
                throw new common_1.ConflictException(`Phone number already exists.`);
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
            if (err?.code === 11000) {
                throw new common_1.ConflictException(`Phone number already exists.`);
            }
            if (err?.name === 'ValidationError') {
                throw new common_1.BadRequestException(err.message);
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
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserService);
//# sourceMappingURL=user.service.js.map