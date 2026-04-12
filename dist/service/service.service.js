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
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const service_schema_1 = require("./schemas/service.schema");
let ServiceService = class ServiceService {
    serviceModel;
    constructor(serviceModel) {
        this.serviceModel = serviceModel;
    }
    sanitize(doc) {
        if (!doc)
            return doc;
        const obj = doc.toObject ? doc.toObject() : doc;
        return obj;
    }
    async create(dto) {
        try {
            const created = await this.serviceModel.create(dto);
            return this.sanitize(created);
        }
        catch (err) {
            if (err?.code === 11000) {
                throw new common_1.ConflictException('Duplicate entry');
            }
            if (err?.name === 'ValidationError') {
                throw new common_1.BadRequestException(err.message);
            }
            throw err;
        }
    }
    async findAll(limit = 20, offset = 0) {
        const items = await this.serviceModel
            .find()
            .populate('vendor_Id', 'businessName profileImage category')
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
        return items.map((i) => this.sanitize(i));
    }
    async findById(id) {
        if (!(0, mongoose_2.isValidObjectId)(id))
            throw new common_1.NotFoundException('Service not found');
        const item = await this.serviceModel.findById(id).exec();
        if (!item)
            throw new common_1.NotFoundException('Service not found');
        return this.sanitize(item);
    }
    async update(id, dto) {
        if (!(0, mongoose_2.isValidObjectId)(id))
            throw new common_1.NotFoundException('Service not found');
        try {
            const updated = await this.serviceModel
                .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
                .exec();
            if (!updated)
                throw new common_1.NotFoundException('Service not found');
            return this.sanitize(updated);
        }
        catch (err) {
            if (err?.code === 11000) {
                throw new common_1.ConflictException('Duplicate entry');
            }
            if (err?.name === 'ValidationError') {
                throw new common_1.BadRequestException(err.message);
            }
            throw err;
        }
    }
    async remove(id) {
        if (!(0, mongoose_2.isValidObjectId)(id))
            throw new common_1.NotFoundException('Service not found');
        const deleted = await this.serviceModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Service not found');
        return this.sanitize(deleted);
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(service_schema_1.Service.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServiceService);
//# sourceMappingURL=service.service.js.map