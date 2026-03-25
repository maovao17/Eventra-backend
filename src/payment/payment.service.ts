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

@Injectable()
export class PaymentService {
  private readonly razorpay: Razorpay;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private bookingService: BookingService,
    private requestService: RequestService,
    private userService: UserService,
  ) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
    }
    
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const customer = await this.userService.findByUserId(createPaymentDto.customerId);
    if (customer.role !== 'customer') {
      throw new ForbiddenException('Only customers can create payments');
    }

    const booking = await this.bookingService.findById(createPaymentDto.bookingId);
    if (booking.customerId !== createPaymentDto.customerId) {
      throw new ForbiddenException('Customers can only pay for their own bookings');
    }

    if (booking.requestId !== createPaymentDto.requestId) {
      throw new BadRequestException('Booking does not match request');
    }

    const request = await this.requestService.findOne(createPaymentDto.requestId);
    if (request.status !== 'accepted') {
      throw new BadRequestException('Payment is allowed only after request acceptance');
    }

    const createdPayment = new this.paymentModel(createPaymentDto);
    const savedPayment = await createdPayment.save();

    if (createPaymentDto.status === 'success') {
      await this.bookingService.update(createPaymentDto.bookingId, { status: 'confirmed' });
    }

    return savedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUser(customerId: string): Promise<Payment[]> {
    return this.paymentModel.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  async findByBooking(bookingId: string): Promise<Payment[]> {
    return this.paymentModel.find({ bookingId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: string, updatePaymentDto: Partial<CreatePaymentDto>): Promise<Payment> {
    const updated = await this.paymentModel.findByIdAndUpdate(id, updatePaymentDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Payment not found');
    return updated;
  }

  async remove(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getRevenue(): Promise<{ totalRevenue: number; successfulPayments: number; failedPayments: number }> {
    const payments = await this.findAll();
    const successfulPayments = payments.filter((payment) => payment.status === 'success');
    const failedPayments = payments.filter((payment) => payment.status === 'failed').length;

    return {
      totalRevenue: successfulPayments.reduce((total, payment) => total + payment.amount, 0),
      successfulPayments: successfulPayments.length,
      failedPayments,
    };
  }


  async createRazorpayOrder(amount: number): Promise<{ orderId: string; amount: number }> {
    try {
      const order = await this.razorpay.orders.create({
        amount: Number(amount) * 100, // convert to paise
        currency: 'INR',
      });

      return {
        orderId: order.id,
        amount: order.amount,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const body = dto.razorpay_order_id + '|' + dto.razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (generatedSignature !== dto.razorpay_signature) {
      console.error('Invalid Razorpay signature');
      return { success: false, message: 'Invalid signature' };
    }

    // Update booking
    await this.bookingService.update(dto.bookingId, {
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    return { success: true };
  }
}

