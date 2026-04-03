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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const firebase_guard_1 = require("../auth/firebase.guard");
const admin_guard_1 = require("../auth/admin.guard");
const vendor_service_1 = require("../vendor/vendor.service");
const user_service_1 = require("../user/user.service");
const booking_service_1 = require("../booking/booking.service");
const payment_service_1 = require("../payment/payment.service");
const event_service_1 = require("../event/event.service");
const update_user_dto_1 = require("../user/dto/update-user.dto");
const create_event_dto_1 = require("../event/dto/create-event.dto");
const update_event_dto_1 = require("../event/dto/update-event.dto");
let AdminController = class AdminController {
    vendorService;
    userService;
    bookingService;
    paymentService;
    eventService;
    constructor(vendorService, userService, bookingService, paymentService, eventService) {
        this.vendorService = vendorService;
        this.userService = userService;
        this.bookingService = bookingService;
        this.paymentService = paymentService;
        this.eventService = eventService;
    }
    async getUsers() {
        return this.userService.findAll();
    }
    async getVendors() {
        return this.vendorService.getAllVendors();
    }
    async approveVendor(id) {
        return this.vendorService.approveVendor(id);
    }
    async rejectVendor(id) {
        return this.vendorService.rejectVendor(id);
    }
    async getBookings() {
        return this.bookingService.findAll();
    }
    async getPayments() {
        return this.paymentService.findAll();
    }
    async updateUser(id, dto) {
        return this.userService.update(id, dto);
    }
    async removeUser(id) {
        return this.userService.remove(id);
    }
    async getEvents() {
        return this.eventService.findAll();
    }
    async createEvent(dto) {
        return this.eventService.create(dto);
    }
    async updateEvent(id, dto) {
        return this.eventService.update(id, dto);
    }
    async removeEvent(id) {
        return this.eventService.remove(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('vendors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVendors", null);
__decorate([
    (0, common_1.Patch)('vendors/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveVendor", null);
__decorate([
    (0, common_1.Patch)('vendors/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectVendor", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Get)('payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeUser", null);
__decorate([
    (0, common_1.Get)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeEvent", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(firebase_guard_1.FirebaseAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [vendor_service_1.VendorService,
        user_service_1.UserService,
        booking_service_1.BookingService,
        payment_service_1.PaymentService,
        event_service_1.EventService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map