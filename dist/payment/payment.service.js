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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_schema_1 = require("./schemas/payment.schema");
const booking_service_1 = require("../booking/booking.service");
const request_service_1 = require("../request/request.service");
const user_service_1 = require("../user/user.service");
let PaymentService = class PaymentService {
    paymentModel;
    bookingService;
    requestService;
    userService;
    constructor(paymentModel, bookingService, requestService, userService) {
        this.paymentModel = paymentModel;
        this.bookingService = bookingService;
        this.requestService = requestService;
        this.userService = userService;
    }
    async create(createPaymentDto) {
        const customer = await this.userService.findByUserId(createPaymentDto.customerId);
        if (customer.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can create payments');
        }
        const booking = await this.bookingService.findById(createPaymentDto.bookingId);
        if (booking.customerId !== createPaymentDto.customerId) {
            throw new common_1.ForbiddenException('Customers can only pay for their own bookings');
        }
        if (booking.requestId !== createPaymentDto.requestId) {
            throw new common_1.BadRequestException('Booking does not match request');
        }
        const request = await this.requestService.findOne(createPaymentDto.requestId);
        if (request.status !== 'accepted') {
            throw new common_1.BadRequestException('Payment is allowed only after request acceptance');
        }
        const createdPayment = new this.paymentModel(createPaymentDto);
        const savedPayment = await createdPayment.save();
        if (createPaymentDto.status === 'success') {
            await this.bookingService.update(createPaymentDto.bookingId, { status: 'confirmed' });
        }
        return savedPayment;
    }
    async findAll() {
        return this.paymentModel.find().sort({ createdAt: -1 }).exec();
    }
    async findByUser(customerId) {
        return this.paymentModel.find({ customerId }).sort({ createdAt: -1 }).exec();
    }
    async findByBooking(bookingId) {
        return this.paymentModel.find({ bookingId }).sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const payment = await this.paymentModel.findById(id).exec();
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return payment;
    }
    async update(id, updatePaymentDto) {
        const updated = await this.paymentModel.findByIdAndUpdate(id, updatePaymentDto, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Payment not found');
        return updated;
    }
    async remove(id) {
        const payment = await this.paymentModel.findByIdAndDelete(id).exec();
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        return payment;
    }
    async getRevenue() {
        const payments = await this.findAll();
        const successfulPayments = payments.filter((payment) => payment.status === 'success');
        const failedPayments = payments.filter((payment) => payment.status === 'failed').length;
        return {
            totalRevenue: successfulPayments.reduce((total, payment) => total + payment.amount, 0),
            successfulPayments: successfulPayments.length,
            failedPayments,
        };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        booking_service_1.BookingService,
        request_service_1.RequestService,
        user_service_1.UserService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map