import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';

@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>) {}

  async findByUserId(userId: string): Promise<Vendor | null> {
    return this.vendorModel.findOne({ userId }).lean();
  }

async updateProfile(userId: string, data: UpdateVendorDto): Promise<Vendor> {
    console.log("VendorService: Saving vendor - UID:", userId, "Data:", data);
    const updateData = {
      ...data,
      profileCompleted: true,
      updatedAt: new Date(),
    };

    return this.vendorModel.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    ).lean() as unknown as Vendor;
  }

  async findAllCompleted(): Promise<Vendor[]> {
    return this.vendorModel.find({ profileCompleted: true }).lean();
  }
}
