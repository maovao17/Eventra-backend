import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payout, PayoutDocument } from './schemas/payout.schema';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';

@Injectable()
export class PayoutService {
  constructor(
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(createPayoutDto: CreatePayoutDto): Promise<PayoutDocument> {
    const createdPayout = new this.payoutModel({
      ...createPayoutDto,
      status: 'pending',
    });

    const saved = await createdPayout.save();

    if (createPayoutDto.bookingId) {
      await this.bookingModel
        .findByIdAndUpdate(createPayoutDto.bookingId, {
          payoutStatus: 'pending',
        })
        .exec();
    }

    return saved;
  }

  async findAll(): Promise<PayoutDocument[]> {
    return this.payoutModel.find().exec();
  }

  async findByVendor(vendorId: string): Promise<PayoutDocument[]> {
    return this.payoutModel.find({ vendorId }).exec();
  }

  async findByEvent(eventId: string): Promise<PayoutDocument[]> {
    return this.payoutModel.find({ eventId }).exec();
  }

  async findByBooking(bookingId: string): Promise<PayoutDocument | null> {
    return this.payoutModel.findOne({ bookingId }).exec();
  }

  async findOne(id: string): Promise<PayoutDocument> {
    const payout = await this.payoutModel.findById(id).exec();
    if (!payout) throw new NotFoundException('Payout not found');
    return payout;
  }

  async update(
    id: string,
    updatePayoutDto: any,
  ): Promise<PayoutDocument> {
    const updated = await this.payoutModel
      .findByIdAndUpdate(id, updatePayoutDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Payout not found');
    return updated;
  }

  async remove(id: string): Promise<PayoutDocument> {
    const deleted = await this.payoutModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Payout not found');
    return deleted;
  }

  async markAsPaid(id: string): Promise<PayoutDocument> {
    const payout = await this.update(id, {
      status: 'paid',
      paidAt: new Date(),
    });

    if (payout.bookingId) {
      await this.bookingModel
        .findByIdAndUpdate(payout.bookingId, { payoutStatus: 'paid' })
        .exec();
    }

    return payout;
  }
}
