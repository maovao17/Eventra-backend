import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { UserModule } from '../user/user.module';

@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>) { }

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

  // Stub for admin
  async getAllVendors(): Promise<Vendor[]> {
    return this.findAllCompleted();
  }

  async approveVendor(id: string): Promise<Vendor> {
    return this.vendorModel.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true, upsert: true }
    ).lean() as unknown as Vendor;
  }

  async rejectVendor(id: string): Promise<Vendor> {
    return this.vendorModel.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true, upsert: true }
    ).lean() as unknown as Vendor;
  }

  async findOne(id: string): Promise<Vendor | null> {
    return this.vendorModel.findById(id).lean();
  }

  async findOneOrThrow(id: string): Promise<Vendor> {
    const vendor = await this.findOne(id);
    if (!vendor) {
      throw new NotFoundException(`Vendor #${id} not found`);
    }
    return vendor;
  }

  async findByUserIdOrThrow(userId: string): Promise<Vendor> {
    const vendor = await this.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundException(`Vendor for user #${userId} not found`);
    }
    return vendor;
  }

  async update(id: string, data: any): Promise<any> {
    try {
      return await this.vendorModel.findByIdAndUpdate(id, data, { new: true });
    } catch (e) {
      console.log("Update fallback:", e);
      return {};
    }
  }
}
