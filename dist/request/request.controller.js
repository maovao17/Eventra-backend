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
const update_request_dto_1 = require("./dto/update-request.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RequestController = class RequestController {
    requestService;
    constructor(requestService) {
        this.requestService = requestService;
    }
    create(createRequestDto) {
        return this.requestService.create(createRequestDto);
    }
    findForVendor(req) {
        return this.requestService.findByVendorUser(req.user.id);
    }
    findAll(userId, vendorId, eventId) {
        if (userId)
            return this.requestService.findByUser(userId);
        if (vendorId)
            return this.requestService.findByVendor(vendorId);
        if (eventId)
            return this.requestService.findByEvent(eventId);
        return this.requestService.findAll();
    }
    findOne(id) {
        return this.requestService.findOne(id);
    }
    update(id, updateRequestDto) {
        return this.requestService.update(id, updateRequestDto);
    }
    remove(id) {
        return this.requestService.remove(id);
    }
    accept(id, actorUserId) {
        return this.requestService.accept(id, actorUserId);
    }
    reject(id, actorUserId) {
        return this.requestService.reject(id, actorUserId);
    }
};
exports.RequestController = RequestController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_request_dto_1.CreateRequestDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('vendor'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "findForVendor", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('vendorId')),
    __param(2, (0, common_1.Query)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_request_dto_1.UpdateRequestDto]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('actorUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "accept", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('actorUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestController.prototype, "reject", null);
exports.RequestController = RequestController = __decorate([
    (0, common_1.Controller)('requests'),
    __metadata("design:paramtypes", [request_service_1.RequestService])
], RequestController);
//# sourceMappingURL=request.controller.js.map