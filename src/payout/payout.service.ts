import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payout, PayoutDocument } from './schemas/payout.schema';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Injectable()
export class PayoutService {
  constructor(
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
  ) {}

  async create(createPayoutDto: CreatePayoutDto): Promise<Payout> {
    const createdPayout = new this.payoutModel({
      ...createPayoutDto,
      status: 'pending',
    });
    return createdPayout.save();
  }

  async findAll(): Promise<Payout[]> {
    return this.payoutModel.find().exec();
  }

  async findByVendor(vendorId: string): Promise<Payout[]> {
    return this.payoutModel.find({ vendorId }).exec();
  }

  async findByEvent(eventId: string): Promise<Payout[]> {
    return this.payoutModel.find({ eventId }).exec();
  }

  async findOne(id: string): Promise<Payout> {
    const payout = await this.payoutModel.findById(id).exec();
    if (!payout) throw new NotFoundException('Payout not found');
    return payout;
  }

  async update(id: string, updatePayoutDto: any): Promise<Payout> {
    const updated = await this.payoutModel.findByIdAndUpdate(id, updatePayoutDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Payout not found');
    return updated;
  }

  async remove(id: string): Promise<Payout> {
    const deleted = await this.payoutModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Payout not found');
    return deleted;
  }

  async markAsPaid(id: string): Promise<Payout> {
    return this.update(id, { status: 'paid' });
  }
}