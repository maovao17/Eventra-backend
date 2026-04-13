import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { BookingService } from '../booking/booking.service';

import { RequestService } from '../request/request.service';
import { UserService } from '../user/user.service';
import { PayoutService } from '../payout/payout.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay | null = null;
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private bookingService: BookingService,
    private requestService: RequestService,
    private userService: UserService,
    private payoutService: PayoutService,
    private notificationService: NotificationService,
  ) {}

  private buildPaymentBreakdown(bookingAmount: number) {
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

  private async ensurePayoutRecord(params: {
    bookingId: string;
    paymentId: string;
    vendorId: string;
    eventId: string;
    bookingAmount: number;
    commissionAmount: number;
    vendorPayoutAmount: number;
  }) {
    const existingPayout = await this.payoutService.findByBooking(
      params.bookingId,
    );
    if (existingPayout) {
      return this.payoutService.update(String((existingPayout as any)._id), {
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
    } as any);
  }

  private getRazorpayKeySecret() {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new BadRequestException('Payment gateway is not configured');
    }

    return keySecret;
  }

  private getRazorpayClient() {
    if (!this.razorpay) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!keyId || !keySecret) {
        throw new BadRequestException('Razorpay is not configured');
      }
      
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return this.razorpay;
  }

  private getRazorpayWebhookSecret() {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException(
        'Razorpay webhook secret is not configured',
      );
    }
    return webhookSecret;
  }

  private verifyRazorpayWebhookSignature(rawBody: string, signature: string) {
    const expectedSignature = crypto
      .createHmac('sha256', this.getRazorpayWebhookSecret())
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid Razorpay webhook signature');
    }
  }

  private async fetchRazorpayPayment(paymentId: string) {
    try {
      const payment = await this.getRazorpayClient().payments.fetch(paymentId);
      return payment;
    } catch {
      throw new BadRequestException('Unable to verify payment with Razorpay');
    }
  }

  private async validateRazorpayPayment(
    razorpayPayment: any,
    expectedOrderId: string,
    expectedAmount: number,
  ) {
    // Validate order_id matches
    if (razorpayPayment.order_id !== expectedOrderId) {
      throw new BadRequestException('Payment order ID mismatch');
    }

    // Validate amount matches (convert to rupees)
    const paymentAmount = Number(razorpayPayment.amount) / 100;
    if (paymentAmount !== expectedAmount) {
      throw new BadRequestException('Payment amount mismatch');
    }

    // Validate payment status is captured (successful)
    if (razorpayPayment.status !== 'captured') {
      throw new BadRequestException('Payment not successfully captured');
    }

    // Validate currency
    if (razorpayPayment.currency !== 'INR') {
      throw new BadRequestException('Invalid payment currency');
    }

    return razorpayPayment;
  }

  private async findSuccessfulPaymentByBooking(bookingId: string) {
    return this.paymentModel
      .findOne({ bookingId, status: 'success' })
      .sort({ createdAt: -1 })
      .exec();
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    if (createPaymentDto.status === 'success') {
      throw new ForbiddenException(
        'Successful payments must be created through Razorpay verification',
      );
    }

    const customer = await this.userService.findByUserId(
      createPaymentDto.customerId,
    );
    if (customer.role !== 'customer') {
      throw new ForbiddenException('Only customers can create payments');
    }

    const booking = await this.bookingService.findById(
      createPaymentDto.bookingId,
    );
    if (booking.customerId !== createPaymentDto.customerId) {
      throw new ForbiddenException(
        'Customers can only pay for their own bookings',
      );
    }

    if (booking.paymentStatus === 'paid') {
      throw new BadRequestException('This booking has already been paid');
    }

    const existingSuccessfulPayment = await this.findSuccessfulPaymentByBooking(
      createPaymentDto.bookingId,
    );
    if (existingSuccessfulPayment) {
      throw new BadRequestException(
        'A successful payment already exists for this booking',
      );
    }

    if (booking.requestId !== createPaymentDto.requestId) {
      throw new BadRequestException('Booking does not match request');
    }

    const request = await this.requestService.findOne(
      createPaymentDto.requestId,
    );
    if (request.status !== 'accepted') {
      throw new BadRequestException(
        'Payment is allowed only after request acceptance',
      );
    }

    if (!['accepted', 'confirmed'].includes(booking.status)) {
      throw new BadRequestException('Booking is not ready for payment');
    }

    const breakdown = this.buildPaymentBreakdown(
      Number(booking.amount ?? booking.price ?? 0),
    );

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

    let savedPayment: PaymentDocument;
    try {
      savedPayment = await createdPayment.save();
    } catch (error) {
      if (
        createPaymentDto.status === 'success' &&
        this.isDuplicateKeyError(error)
      ) {
        throw new BadRequestException(
          'A successful payment already exists for this booking',
        );
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
          message:
            'Your payment was confirmed and the booking is now locked in.',
        });

        await this.notificationService.create({
          vendorId: booking.vendorId,
          bookingId: createPaymentDto.bookingId,
          type: 'booking-paid',
          message:
            'A customer payment has been completed and payout is pending.',
        });
      } catch (error) {
        console.error('Payment post-processing failed', error);
      }
    }

    return savedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUser(customerId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCustomer(customerId: string): Promise<Payment[]> {
    return this.findByUser(customerId);
  }

  async findByVendorUser(vendorUserId: string): Promise<Payment[]> {
    const vendorBookings =
      await this.bookingService.findByVendorUser(vendorUserId);
    const bookingIds = vendorBookings.map((booking) => String(booking._id));

    if (!bookingIds.length) {
      return [];
    }

    return this.paymentModel
      .find({ bookingId: { $in: bookingIds } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByBooking(bookingId: string): Promise<Payment[]> {
    return this.paymentModel.find({ bookingId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async assertVendorCanAccessPayment(paymentId: string, vendorUserId: string) {
    const payment = await this.findOne(paymentId);
    await this.bookingService.assertVendorOwnership(
      payment.bookingId,
      vendorUserId,
    );
    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: Partial<CreatePaymentDto>,
  ): Promise<Payment> {
    const updated = await this.paymentModel
      .findByIdAndUpdate(id, updatePaymentDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Payment not found');
    return updated;
  }

  async remove(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async processRazorpayWebhook(rawBody: string, signature: string) {
    this.verifyRazorpayWebhookSignature(rawBody, signature);

    type RazorpayPaymentEntity = {
      id: string;
      order_id: string;
      status: string;
      amount: number;
      notes?: { bookingId?: string | null };
    };

    type RazorpayWebhookBody = {
      event?: string;
      payload?: {
        payment?: {
          entity?: RazorpayPaymentEntity;
        };
      };
    };

    let eventBody: RazorpayWebhookBody;
    try {
      eventBody = JSON.parse(rawBody) as RazorpayWebhookBody;
    } catch {
      throw new BadRequestException('Invalid webhook payload');
    }

    const eventType = String(eventBody?.event || '');
    if (!eventType.startsWith('payment.')) {
      return { success: true, message: 'Ignored non-payment event' };
    }

    const paymentEntity = eventBody.payload?.payment?.entity;
    if (!paymentEntity) {
      throw new BadRequestException('Invalid payment payload');
    }

    const razorpayPaymentId = String(paymentEntity.id);
    const razorpayOrderId = String(paymentEntity.order_id || '');
    const razorpayStatus = String(paymentEntity.status || '').toLowerCase();
    const amount = Number(paymentEntity.amount || 0) / 100;
    const notes = paymentEntity.notes || {};

    // Idempotency: if payment already exists, do nothing
    const existingPayment = await this.paymentModel
      .findOne({ razorpayPaymentId })
      .exec();

    if (existingPayment) {
      return { success: true, message: 'Payment already processed' };
    }

    const bookingId = String(notes.bookingId || '');
    if (!bookingId) {
      throw new BadRequestException('Missing bookingId in webhook notes');
    }

    const booking = await this.bookingService.findById(bookingId);
    const expectedAmount = this.buildPaymentBreakdown(
      Number(booking.amount ?? booking.price ?? 0),
    ).totalCharge;

    if (amount !== expectedAmount) {
      return { success: true, message: 'Ignored payment amount mismatch' };
    }

    const existingSuccessfulPayment =
      await this.findSuccessfulPaymentByBooking(bookingId);
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
      platformFee: this.buildPaymentBreakdown(
        Number(booking.amount ?? booking.price ?? 0),
      ).platformFee,
      commissionAmount: this.buildPaymentBreakdown(
        Number(booking.amount ?? booking.price ?? 0),
      ).commissionAmount,
      vendorPayoutAmount: this.buildPaymentBreakdown(
        Number(booking.amount ?? booking.price ?? 0),
      ).vendorPayoutAmount,
      status,
      razorpayPaymentId,
      razorpayOrderId,
    });

    let savedPayment: PaymentDocument;
    try {
      savedPayment = await createdPayment.save();
    } catch (error) {
      if (status === 'success' && this.isDuplicateKeyError(error)) {
        const successfulPayment =
          await this.findSuccessfulPaymentByBooking(bookingId);
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
          message:
            'Your payment was confirmed and the booking is now locked in.',
        });

        await this.notificationService.create({
          vendorId: booking.vendorId,
          bookingId,
          type: 'booking-paid',
          message:
            'A customer payment has been completed and payout is pending.',
        });
      } catch (error) {
        console.error('Webhook payment post-processing failed', error);
      }
    }

    return { success: true, paymentId: String(savedPayment._id) };
  }

  async getRevenue(): Promise<{
    totalRevenue: number;
    successfulPayments: number;
    failedPayments: number;
  }> {
    const payments = await this.findAll();
    const successfulPayments = payments.filter(
      (payment) => payment.status === 'success',
    );
    const failedPayments = payments.filter(
      (payment) => payment.status === 'failed',
    ).length;

    return {
      totalRevenue: successfulPayments.reduce(
        (total, payment) =>
          total +
          Number(payment.platformFee || 0) +
          Number(payment.commissionAmount || 0),
        0,
      ),
      successfulPayments: successfulPayments.length,
      failedPayments,
    };
  }

  async createRazorpayOrder(
    bookingId: string,
    actorUserId: string,
  ): Promise<{ orderId: string; amount: number }> {
    const booking = await this.bookingService.findById(bookingId);
    if (booking.customerId !== actorUserId) {
      throw new ForbiddenException(
        'Customers can only create orders for their own bookings',
      );
    }

    if (booking.status !== 'accepted') {
      throw new BadRequestException('Booking is not awaiting payment');
    }

    if (booking.paymentStatus === 'paid') {
      throw new BadRequestException('This booking has already been paid');
    }

    const breakdown = this.buildPaymentBreakdown(
      Number(booking.amount ?? booking.price ?? 0),
    );
    const amount = breakdown.totalCharge;
    try {
      const order = await this.getRazorpayClient().orders.create({
        amount: Number(amount) * 100, // convert to paise
        currency: 'INR',
        notes: {
          bookingId: bookingId, // ✅ Store bookingId in order notes for verification
          customerId: booking.customerId,
          vendorId: booking.vendorId,
        },
      });

      return {
        orderId: order.id,
        amount: Number(order.amount),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      throw new BadRequestException(`Failed to create order: ${message}`);
    }
  }

  async verifyPayment(dto: VerifyPaymentDto, actorUserId: string) {
    // 1. Verify Razorpay signature first
    const body = dto.razorpay_order_id + '|' + dto.razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac('sha256', this.getRazorpayKeySecret())
      .update(body)
      .digest('hex');

    if (generatedSignature !== dto.razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // 2. Fetch payment details from Razorpay API (DO NOT TRUST FRONTEND)
    const razorpayPayment = await this.fetchRazorpayPayment(dto.razorpay_payment_id);

    // 3. Extract bookingId from Razorpay order notes (NOT from frontend dto.bookingId)
    const orderNotes = razorpayPayment.notes || {};
    const bookingId = String(orderNotes.bookingId || '');

    if (!bookingId) {
      throw new BadRequestException('Invalid payment: missing booking reference');
    }

    // 4. Fetch and validate booking
    const booking = await this.bookingService.findById(bookingId);

    // 5. Verify customer ownership
    if (booking.customerId !== actorUserId) {
      throw new ForbiddenException(
        'Customers can only verify payments for their own bookings',
      );
    }

    // 6. Verify booking status
    if (booking.status !== 'accepted') {
      throw new BadRequestException('Booking is not awaiting payment');
    }

    // 7. Calculate expected amount
    const expectedAmount = this.buildPaymentBreakdown(
      Number(booking.amount ?? booking.price ?? 0),
    ).totalCharge;

    // 8. Validate payment with Razorpay data
    await this.validateRazorpayPayment(
      razorpayPayment,
      dto.razorpay_order_id,
      expectedAmount,
    );

    // 9. Prevent duplicate successful payment processing
    const existingSuccessfulPayment =
      await this.findSuccessfulPaymentByBooking(bookingId);
    if (existingSuccessfulPayment || booking.paymentStatus === 'paid') {
      throw new BadRequestException('This booking has already been paid');
    }

    // 10. Create payment record with validated data
    const breakdown = this.buildPaymentBreakdown(
      Number(booking.amount ?? booking.price ?? 0),
    );

    let payment: PaymentDocument;
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
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        const successfulPayment =
          await this.findSuccessfulPaymentByBooking(bookingId);
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
          payoutId: String((payout as any)._id),
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
    } catch (error) {
      console.error('Verified payment post-processing failed', error);
    }

    return { success: true, paymentId: String(payment._id) };
  }
}
