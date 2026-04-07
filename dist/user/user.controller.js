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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const firebase_guard_1 = require("../auth/firebase.guard");
const firebase_bootstrap_guard_1 = require("../auth/firebase-bootstrap.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
let UserController = class UserController {
    userservice;
    constructor(userservice) {
        this.userservice = userservice;
    }
    create(req, createUserDto) {
        const { email: _ignoredEmail, ...safeCreateUserDto } = createUserDto;
        return this.userservice.create({
            ...safeCreateUserDto,
            userId: req.user.uid,
            email: req.user.email || undefined,
        });
    }
    getMe(req) {
        return this.userservice.findByUserId(req.user.userId);
    }
    async list(req, limit = '20', offset = '0', userId) {
        if (userId) {
            if (req.user.userId === userId) {
                return this.userservice.findByUserId(userId);
            }
            if (req.user.role === 'admin') {
                return this.userservice.findByUserId(userId);
            }
            if (req.user.role === 'vendor') {
                return this.userservice.assertVendorCanAccessUser(req.user.userId, userId);
            }
            throw new common_1.ForbiddenException('You do not have access to this user');
        }
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Admin access only');
        }
        const l = Number(limit);
        const o = Number(offset);
        return this.userservice.findAll(isNaN(l) ? 20 : l, isNaN(o) ? 0 : o);
    }
    async get(req, id) {
        const user = await this.userservice.findById(id);
        if (req.user.role === 'admin') {
            return user;
        }
        if (String(user.userId) === String(req.user.userId)) {
            return user;
        }
        if (req.user.role === 'vendor') {
            return this.userservice.assertVendorCanAccessUser(req.user.userId, String(user.userId));
        }
        throw new common_1.ForbiddenException('You do not have access to this user');
    }
    async update(req, id, updateUserDto) {
        const targetUser = await this.userservice.findById(id);
        if (req.user.role !== 'admin' &&
            String(targetUser.userId) !== String(req.user.userId)) {
            throw new common_1.ForbiddenException('Users can only update their own profile');
        }
        return this.userservice.update(id, updateUserDto);
    }
    async remove(req, id) {
        const targetUser = await this.userservice.findById(id);
        if (req.user.role !== 'admin' &&
            String(targetUser.userId) !== String(req.user.userId)) {
            throw new common_1.ForbiddenException('Users can only delete their own profile');
        }
        return this.userservice.remove(id);
    }
    async approveVendor(userId) {
        return this.userservice.approveVendor(userId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.UseGuards)(firebase_bootstrap_guard_1.FirebaseBootstrapGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "get", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)('approve-vendor/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "approveVendor", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map