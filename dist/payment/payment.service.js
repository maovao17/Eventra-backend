"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_schema_1 = require("./schemas/payment.schema");
const booking_service_1 = require("../booking/booking.service");
const request_service_1 = require("../request/request.service");
const user_service_1 = require("../user/user.service");
const payout_service_1 = require("../payout/payout.service");
const notification_service_1 = require("../notification/notification.service");
let PaymentService = class PaymentService {
    paymentModel;
    bookingService;
    requestService;
    userService;
    payoutService;
    notificationService;
    razorpay = null;
    constructor(paymentModel, bookingService, requestService, userService, payoutService, notificationService) {
        this.paymentModel = paymentModel;
        this.bookingService = bookingService;
        this.requestService = requestService;
        this.userService = userService;
        this.payoutService = payoutService;
        this.notificationService = notificationService;
    }
    buildPaymentBreakdown(bookingAmount) {
        const normalizedBookingAmount = Number(bookingAmount || 0);
        const platformFee = 0;
        const commissionAmount = 0;
        const vendorPayoutAmount = normalizedBookingAmount;
        return {
            bookingAmount: normalizedBookingAmount,
            platformFee,
            commissionAmount,
            vendorPayoutAmount,
            totalCharge: normalizedBookingAmount,
        };
    }
    async ensurePayoutRecord(params) {
        const existingPayout = await this.payoutService.findByBooking(params.bookingId);
        if (existingPayout) {
            return this.payoutService.update(String(existingPayout._id), {
                vendorId: params.vendorId,
                eventId: params.eventId,
                bookingId: params.bookingId,
                totalEarned: params.bookingAmount,
                commissionCut: params.commissionAmount,
                payoutAmount: params.vendorPayoutAmount,
            });
        }
        return this.payoutService.create({
            bookingId: params.bookingId,
            paymentId: params.paymentId,
            vendorId: params.vendorId,
            eventId: params.eventId,
            totalEarned: params.bookingAmount,
            commissionCut: params.commissionAmount,
            payoutAmount: params.vendorPayoutAmount,
        });
    }
    getRazorpayKeySecret() {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            throw new common_1.BadRequestException('Payment gateway is not configured');
        }
        return keySecret;
    }
    getRazorpayClient() {
        if (!this.razorpay) {
            const keyId = process.env.RAZORPAY_KEY_ID;
            const keySecret = process.env.RAZORPAY_KEY_SECRET;
            if (!keyId || !keySecret) {
                throw new common_1.BadRequestException('Razorpay is not configured');
            }
            this.razorpay = new razorpay_1.default({
                key_id: keyId,
                key_secret: keySecret,
            });
        }
        return this.razorpay;
    }
    getRazorpayWebhookSecret() {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Razorpay webhook secret is not configured');
        }
        return webhookSecret;
    }
    verifyRazorpayWebhookSignature(rawBody, signature) {
        const expectedSignature = crypto
            .createHmac('sha256', this.getRazorpayWebhookSecret())
            .update(rawBody)
            .digest('hex');
        if (expectedSignature !== signature) {
            throw new common_1.BadRequestException('Invalid Razorpay webhook signature');
        }
    }
    async fetchRazorpayPayment(paymentId) {
        try {
            const payment = await this.getRazorpayClient().payments.fetch(paymentId);
            return payment;
        }
        catch {
            throw new common_1.BadRequestException('Unable to verify payment with Razorpay');
        }
    }
    async validateRazorpayPayment(razorpayPayment, expectedOrderId, expectedAmount) {
        if (razorpayPayment.order_id !== expectedOrderId) {
            throw new common_1.BadRequestException('Payment order ID mismatch');
        }
        const paymentAmount = Number(razorpayPayment.amount) / 100;
        if (paymentAmount !== expectedAmount) {
            throw new common_1.BadRequestException('Payment amount mismatch');
        }
        if (razorpayPayment.status !== 'captured') {
            throw new common_1.BadRequestException('Payment not successfully captured');
        }
        if (razorpayPayment.currency !== 'INR') {
            throw new common_1.BadRequestException('Invalid payment currency');
        }
        return razorpayPayment;
    }
    async findSuccessfulPaymentByBooking(bookingId) {
        return this.paymentModel
            .findOne({ bookingId, status: 'success' })
            .sort({ createdAt: -1 })
            .exec();
    }
    isDuplicateKeyError(error) {
        return (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 11000);
    }
    async create(createPaymentDto) {
        if (createPaymentDto.status === 'success') {
            throw new common_1.ForbiddenException('Successful payments must be created through Razorpay verification');
        }
        const customer = await this.userService.findByUserId(createPaymentDto.customerId);
        if (customer.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can create payments');
        }
        const booking = await this.bookingService.findById(createPaymentDto.bookingId);
        if (booking.customerId !== createPaymentDto.customerId) {
            throw new common_1.ForbiddenException('Customers can only pay for their own bookings');
        }
        if (booking.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('This booking has already been paid');
        }
        const existingSuccessfulPayment = await this.findSuccessfulPaymentByBooking(createPaymentDto.bookingId);
        if (existingSuccessfulPayment) {
            throw new common_1.BadRequestException('A successful payment already exists for this booking');
        }
        if (booking.requestId !== createPaymentDto.requestId) {
            throw new common_1.BadRequestException('Booking does not match request');
        }
        const request = await this.requestService.findOne(createPaymentDto.requestId);
        if (request.status !== 'accepted') {
            throw new common_1.BadRequestException('Payment is allowed only after request acceptance');
        }
        if (!['accepted', 'confirmed'].includes(booking.status)) {
            throw new common_1.BadRequestException('Booking is not ready for payment');
        }
        const breakdown = this.buildPaymentBreakdown(Number(booking.amount ?? booking.price ?? 0));
        const createdPayment = new this.paymentModel({
            ...createPaymentDto,
            eventId: booking.eventId,
            vendorId: booking.vendorId,
            bookingAmount: breakdown.bookingAmount,
            platformFee: breakdown.platformFee,
            commissionAmount: breakdown.commissionAmount,
            vendorPayoutAmount: breakdown.vendorPayoutAmount,
            razorpayPaymentId: createPaymentDto.razorpayPaymentId,
            razorpayOrderId: createPaymentDto.razorpayOrderId,
        });
        let savedPayment;
        try {
            savedPayment = await createdPayment.save();
        }
        catch (error) {
            if (createPaymentDto.status === 'success' &&
                this.isDuplicateKeyError(error)) {
                throw new common_1.BadRequestException('A successful payment already exists for this booking');
            }
            throw error;
        }
        if (createPaymentDto.status === 'success') {
            try {
                await this.bookingService.update(createPaymentDto.bookingId, {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                });
                const payout = await this.ensurePayoutRecord({
                    bookingId: createPaymentDto.bookingId,
                    paymentId: String(savedPayment._id),
                    vendorId: booking.vendorId,
                    eventId: booking.eventId,
                    bookingAmount: breakdown.bookingAmount,
                    commissionAmount: breakdown.commissionAmount,
                    vendorPayoutAmount: breakdown.vendorPayoutAmount,
                });
                await this.paymentModel
                    .findByIdAndUpdate(savedPayment._id, {
                    payoutId: String(payout._id),
                })
                    .exec();
                await this.notificationService.create({
                    userId: booking.customerId,
                    bookingId: createPaymentDto.bookingId,
                    type: 'payment-confirmed',
                    message: 'Your payment was confirmed and the booking is now locked in.',
                });
                await this.notificationService.create({
                    vendorId: booking.vendorId,
                    bookingId: createPaymentDto.bookingId,
                    type: 'booking-paid',
                    message: 'A customer payment has been completed and payout is pending.',
                });
            }
            catch (error) {
                console.error('Payment post-processing failed', error);
            }
        }
        return savedPayment;
    }
    async findAll() {
        return this.paymentModel.find().sort({ createdAt: -1 }).exec();
    }
    async findByUser(customerId) {
        return this.paymentModel
            .find({ customerId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByCustomer(customerId) {
        return this.findByUser(customerId);
    }
    async findByVendorUser(vendorUserId) {
        const vendorBookings = await this.bookingService.findByVendorUser(vendorUserId);
        const bookingIds = vendorBookings.map((booking) => String(booking._id));
        if (!bookingIds.length) {
            return [];
        }
        return this.paymentModel
            .find({ bookingId: { $in: bookingIds } })
            .sort({ createdAt: -1 })
            .exec();
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
    async assertVendorCanAccessPayment(paymentId, vendorUserId) {
        const payment = await this.findOne(paymentId);
        await this.bookingService.assertVendorOwnership(payment.bookingId, vendorUserId);
        return payment;
    }
    async update(id, updatePaymentDto) {
        const updated = await this.paymentModel
            .findByIdAndUpdate(id, updatePaymentDto, { new: true })
            .exec();
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
    async processRazorpayWebhook(rawBody, signature) {
        this.verifyRazorpayWebhookSignature(rawBody, signature);
        let eventBody;
        try {
            eventBody = JSON.parse(rawBody);
        }
        catch {
            throw new common_1.BadRequestException('Invalid webhook payload');
        }
        const eventType = String(eventBody?.event || '');
        if (!eventType.startsWith('payment.')) {
            return { success: true, message: 'Ignored non-payment event' };
        }
        const paymentEntity = eventBody.payload?.payment?.entity;
        if (!paymentEntity) {
            throw new common_1.BadRequestException('Invalid payment payload');
        }
        const razorpayPaymentId = String(paymentEntity.id);
        const razorpayOrderId = String(paymentEntity.order_id || '');
        const razorpayStatus = String(paymentEntity.status || '').toLowerCase();
        const amount = Number(paymentEntity.amount || 0) / 100;
        const notes = paymentEntity.notes || {};
        const existingPayment = await this.paymentModel
            .findOne({ razorpayPaymentId })
            .exec();
        if (existingPayment) {
            return { success: true, message: 'Payment already processed' };
        }
        const bookingId = String(notes.bookingId || '');
        if (!bookingId) {
            throw new common_1.BadRequestException('Missing bookingId in webhook notes');
        }
        const booking = await this.bookingService.findById(bookingId);
        const expectedAmount = this.buildPaymentBreakdown(Number(booking.amount ?? booking.price ?? 0)).totalCharge;
        if (amount !== expectedAmount) {
            return { success: true, message: 'Ignored payment amount mismatch' };
        }
        const existingSuccessfulPayment = await this.findSuccessfulPaymentByBooking(bookingId);
        if (existingSuccessfulPayment || booking.paymentStatus === 'paid') {
            return { success: true, message: 'Booking already paid' };
        }
        const status = razorpayStatus === 'captured' ? 'success' : 'failed';
        const createdPayment = new this.paymentModel({
            bookingId,
            eventId: booking.eventId,
            vendorId: booking.vendorId,
            customerId: booking.customerId,
            requestId: booking.requestId,
            amount,
            bookingAmount: booking.amount ?? booking.price ?? 0,
            platformFee: this.buildPaymentBreakdown(Number(booking.amount ?? booking.price ?? 0)).platformFee,
            commissionAmount: this.buildPaymentBreakdown(Number(booking.amount ?? booking.price ?? 0)).commissionAmount,
            vendorPayoutAmount: this.buildPaymentBreakdown(Number(booking.amount ?? booking.price ?? 0)).vendorPayoutAmount,
            status,
            razorpayPaymentId,
            razorpayOrderId,
        });
        let savedPayment;
        try {
            savedPayment = await createdPayment.save();
        }
        catch (error) {
            if (status === 'success' && this.isDuplicateKeyError(error)) {
                const successfulPayment = await this.findSuccessfulPaymentByBooking(bookingId);
                if (successfulPayment) {
                    return {
                        success: true,
                        paymentId: String(successfulPayment._id),
                        message: 'Booking already paid',
                    };
                }
            }
            throw error;
        }
        if (status === 'success') {
            try {
                await this.bookingService.update(bookingId, {
                    status: 'confirmed',
                    paymentStatus: 'paid',
                });
                await this.ensurePayoutRecord({
                    bookingId,
                    paymentId: String(savedPayment._id),
                    vendorId: booking.vendorId,
                    eventId: booking.eventId,
                    bookingAmount: savedPayment.bookingAmount || 0,
                    commissionAmount: savedPayment.commissionAmount || 0,
                    vendorPayoutAmount: savedPayment.vendorPayoutAmount || 0,
                });
                await this.notificationService.create({
                    userId: booking.customerId,
                    bookingId,
                    type: 'payment-confirmed',
                    message: 'Your payment was confirmed and the booking is now locked in.',
                });
                await this.notificationService.create({
                    vendorId: booking.vendorId,
                    bookingId,
                    type: 'booking-paid',
                    message: 'A customer payment has been completed and payout is pending.',
                });
            }
            catch (error) {
                console.error('Webhook payment post-processing failed', error);
            }
        }
        return { success: true, paymentId: String(savedPayment._id) };
    }
    async getRevenue() {
        const payments = await this.findAll();
        const successfulPayments = payments.filter((payment) => payment.status === 'success');
        const failedPayments = payments.filter((payment) => payment.status === 'failed').length;
        return {
            totalRevenue: successfulPayments.reduce((total, payment) => total +
                Number(payment.platformFee || 0) +
                Number(payment.commissionAmount || 0), 0),
            successfulPayments: successfulPayments.length,
            failedPayments,
        };
    }
    async createRazorpayOrder(bookingId, actorUserId) {
        const booking = await this.bookingService.findById(bookingId);
        if (booking.customerId !== actorUserId) {
            throw new common_1.ForbiddenException('Customers can only create orders for their own bookings');
        }
        if (booking.status !== 'accepted') {
            throw new common_1.BadRequestException('Booking is not awaiting payment');
        }
        if (booking.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('This booking has already been paid');
        }
        let bookingAmount = Number(booking.amount ?? booking.price ?? 0);
        if (bookingAmount === 0 && booking.requestId) {
            try {
                bookingAmount = await this.requestService.resolveAmount(booking.requestId);
                if (bookingAmount > 0) {
                    await this.bookingService.update(bookingId, { amount: bookingAmount });
                }
            }
            catch { }
        }
        const breakdown = this.buildPaymentBreakdown(bookingAmount);
        const amount = breakdown.totalCharge;
        try {
            const order = await this.getRazorpayClient().orders.create({
                amount: Number(amount) * 100,
                currency: 'INR',
                notes: {
                    bookingId: bookingId,
                    customerId: booking.customerId,
                    vendorId: booking.vendorId,
                },
            });
            return {
                orderId: order.id,
                amount: Number(order.amount),
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create order';
            throw new common_1.BadRequestException(`Failed to create order: ${message}`);
        }
    }
    async verifyPayment(dto, actorUserId) {
        const body = dto.razorpay_order_id + '|' + dto.razorpay_payment_id;
        const generatedSignature = crypto
            .createHmac('sha256', this.getRazorpayKeySecret())
            .update(body)
            .digest('hex');
        if (generatedSignature !== dto.razorpay_signature) {
            throw new common_1.BadRequestException('Invalid payment signature');
        }
        const razorpayPayment = await this.fetchRazorpayPayment(dto.razorpay_payment_id);
        const orderNotes = razorpayPayment.notes || {};
        const bookingId = String(orderNotes.bookingId || '');
        if (!bookingId) {
            throw new common_1.BadRequestException('Invalid payment: missing booking reference');
        }
        const booking = await this.bookingService.findById(bookingId);
        if (booking.customerId !== actorUserId) {
            throw new common_1.ForbiddenException('Customers can only verify payments for their own bookings');
        }
        if (booking.status !== 'accepted') {
            throw new common_1.BadRequestException('Booking is not awaiting payment');
        }
        const expectedAmount = this.buildPaymentBreakdown(Number(booking.amount ?? booking.price ?? 0)).totalCharge;
        await this.validateRazorpayPayment(razorpayPayment, dto.razorpay_order_id, expectedAmount);
        const existingSuccessfulPayment = await this.findSuccessfulPaymentByBooking(bookingId);
        if (existingSuccessfulPayment || booking.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('This booking has already been paid');
        }
        const breakdown = this.buildPaymentBreakdown(Number(booking.amount ?? booking.price ?? 0));
        let payment;
        try {
            payment = await this.paymentModel.create({
                bookingId,
                eventId: booking.eventId,
                vendorId: booking.vendorId,
                customerId: booking.customerId,
                requestId: booking.requestId,
                amount: expectedAmount,
                bookingAmount: breakdown.bookingAmount,
                platformFee: breakdown.platformFee,
                commissionAmount: breakdown.commissionAmount,
                vendorPayoutAmount: breakdown.vendorPayoutAmount,
                status: 'success',
                razorpayPaymentId: dto.razorpay_payment_id,
                razorpayOrderId: dto.razorpay_order_id,
            });
        }
        catch (error) {
            if (this.isDuplicateKeyError(error)) {
                const successfulPayment = await this.findSuccessfulPaymentByBooking(bookingId);
                if (successfulPayment) {
                    return {
                        success: true,
                        paymentId: String(successfulPayment._id),
                    };
                }
            }
            throw error;
        }
        try {
            await this.bookingService.update(bookingId, {
                status: 'confirmed',
                paymentStatus: 'paid',
            });
            const payout = await this.ensurePayoutRecord({
                bookingId,
                paymentId: String(payment._id),
                vendorId: booking.vendorId,
                eventId: booking.eventId,
                bookingAmount: breakdown.bookingAmount,
                commissionAmount: breakdown.commissionAmount,
                vendorPayoutAmount: breakdown.vendorPayoutAmount,
            });
            await this.paymentModel
                .findByIdAndUpdate(payment._id, {
                payoutId: String(payout._id),
            })
                .exec();
            await this.notificationService.create({
                userId: booking.customerId,
                bookingId,
                type: 'payment-confirmed',
                message: 'Your payment was confirmed and the booking is now locked in.',
            });
            await this.notificationService.create({
                vendorId: booking.vendorId,
                bookingId,
                type: 'booking-paid',
                message: 'A customer payment has been completed and payout is pending.',
            });
        }
        catch (error) {
            console.error('Verified payment post-processing failed', error);
        }
        return { success: true, paymentId: String(payment._id) };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        booking_service_1.BookingService,
        request_service_1.RequestService,
        user_service_1.UserService,
        payout_service_1.PayoutService,
        notification_service_1.NotificationService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map