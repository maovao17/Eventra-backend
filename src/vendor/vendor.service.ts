import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { ReviewService } from '../review/review.service';
import { BookingService } from '../booking/booking.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    private reviewService: ReviewService,
    private bookingService: BookingService,
    private notificationService: NotificationService
  ) { }

async findByUserId(userId: string): Promise<any | null> {
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

async approveVendor(id: string): Promise<Vendor> {
    return this.vendorModel.findByIdAndUpdate(
      id,
      { isApproved: true, isVerified: true, status: 'approved' },
      { new: true }
    ).lean() as unknown as Vendor;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return this.vendorModel.find().lean();
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

  async getVendorReviews(uid: string) {
    try {
      const vendor = await this.findByUserId(uid);
      if (!vendor?._id) return [];
      console.log("UID:", uid, "Vendor:", vendor);
      return await this.reviewService.findByVendor(String(vendor._id));
    } catch (e) {
      console.error("getVendorReviews ERROR:", e);
      return [];
    }
  }

  async getVendorBookings(uid: string) {
    try {
      console.log("UID:", uid);
      const result = await this.bookingService.findByVendorUser(uid);
      console.log("Bookings result:", result);
      return result;
    } catch (e) {
      console.error("getVendorBookings ERROR:", e);
      return [];
    }
  }

  async getVendorNotifications(uid: string) {
    try {
      const vendor = await this.findByUserId(uid);
      if (!vendor?._id) return [];
      console.log("UID:", uid, "Vendor:", vendor);
      return await this.notificationService.findByVendor(String(vendor._id));
    } catch (e) {
      console.error("getVendorNotifications ERROR:", e);
      return [];
    }
  }
}

