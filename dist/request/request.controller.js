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
exports.RequestController = void 0;
const common_1 = require("@nestjs/common");
const request_service_1 = require("./request.service");
const create_request_dto_1 = require("./dto/create-request.dto");
const vendor_service_1 = require("../vendor/vendor.service");
const firebase_guard_1 = require("../auth/firebase.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let RequestController = class RequestController {
    requestService;
    vendorService;
    constructor(requestService, vendorService) {
        this.requestService = requestService;
        this.vendorService = vendorService;
    }
    create(req, createRequestDto) {
        return this.requestService.create({
            ...createRequestDto,
            customerId: req.user.uid,
        });
    }
    findForVendor(req) {
        return this.requestService.findByVendorUser(req.user.uid);
    }
    async findAll(req, eventId, userId, vendorId) {
        if (req.user.role === 'admin') {
            return this.requestService.findByQuery({
                customerId: userId,
                vendorId,
                eventId,
            });
        }
        if (req.user.role === 'vendor') {
            const vendor = await this.vendorService.findByUserId(req.user.uid);
            if (!vendor) {
                throw new common_1.NotFoundException('Vendor profile not found');
            }
            const ownVendorId = String(vendor._id);
            if (vendorId && String(vendorId) !== ownVendorId) {
                throw new common_1.ForbiddenException('You can only query your own vendor requests');
            }
            const queryVendorId = vendorId || ownVendorId;
            if (eventId) {
                return this.requestService
                    .findByQuery({ vendorId: queryVendorId, eventId })
                    .then((requests) => requests.map((request) => ({
                    ...request.toObject(),
                    vendor: vendor,
                })));
            }
            return this.requestService.findByVendorUser(req.user.uid);
        }
        if (userId && String(userId) !== String(req.user.uid)) {
            throw new common_1.ForbiddenException('Customers can only query their own requests');
        }
        const queryCustomerId = String(req.user.uid);
        if (vendorId || eventId) {
            return this.requestService.findByQuery({
                customerId: queryCustomerId,
                vendorId,
                eventId,
            });
        }
        return this.requestService.findByUser(queryCustomerId);
    }
    async findOne(req, id) {
        const request = await this.requestService.findOne(id);
        if (req.user.role === 'admin') {
            return request;
        }
        if (req.user.role === 'customer' &&
            String(request.customerId) === String(req.user.uid)) {
            return request;
        }
        if (req.user.role === 'vendor') {
            const vendorRequests = await this.requestService.findByVendorUser(req.user.uid);
            const allowedRequest = vendorRequests.find((item) => String(item._id) === String(id));
            if (allowedRequest) {
                return request;
            }
        }
        throw new common_1.ForbiddenException('You do not have access to this request');
    }
    accept(req, id) {
        return this.requestService.accept(id, req.user.uid);
    }
    reject(req, id) {
        return this.requestService.reject(id, req.user.uid);
    }
};
exports.RequestController = RequestController;
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_request_dto_1.CreateRequestDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Get)('vendor'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "findForVendor", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('eventId')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'vendor', 'admin'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "accept", null);
__decorate([
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('vendor'),
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "reject", null);
exports.RequestController = RequestController = __decorate([
    (0, common_1.Controller)('requests'),
    __metadata("design:paramtypes", [request_service_1.RequestService,
        vendor_service_1.VendorService])
], RequestController);
//# sourceMappingURL=request.controller.js.map