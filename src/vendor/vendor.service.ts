import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { Request, RequestDocument } from '../request/schemas/request.schema';
import { ReviewService } from '../review/review.service';
import { BookingService } from '../booking/booking.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    private reviewService: ReviewService,
    private bookingService: BookingService,
    private notificationService: NotificationService
  ) { }

async findByUserId(userId: string): Promise<any | null> {
    return this.vendorModel.findOne({ userId }).lean();
  }

  async updateProfile(userId: string, data: UpdateVendorDto): Promise<Vendor> {
    console.log("VendorService: Saving vendor - UID:", userId, "Data:", data);
    return this.vendorModel.findOneAndUpdate(
      { userId },
      { $set: { ...data, profileCompleted: true, updatedAt: new Date() } },
      { new: true, upsert: true }
    ).lean() as unknown as Vendor;
  }

  async findAllCompleted(): Promise<Vendor[]> {
    return this.vendorModel.find({
      profileCompleted: true,
      $or: [{ status: 'approved' }, { isApproved: true }],
    }).lean();
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

  async getDashboardStats(userId: string) {
    const vendor = await this.findByUserId(userId);
    if (!vendor) return null;

    const vendorId = String((vendor as any)._id);
    const currentYear = new Date().getFullYear();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const [bookings, pendingCount, reviews] = await Promise.all([
      this.bookingService.findByVendor(vendorId),
      this.requestModel.countDocuments({ vendorId, status: 'pending' }).exec(),
      this.reviewService.findByVendor(vendorId),
    ]);

    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
    const revenue = paidBookings.reduce((sum, b) => sum + Number(b.amount || 0), 0);

    const monthlyRevenue = months.map((month, i) => ({
      month,
      revenue: paidBookings
        .filter(b => {
          const d = new Date((b as any).createdAt || 0);
          return d.getFullYear() === currentYear && d.getMonth() === i;
        })
        .reduce((sum, b) => sum + Number(b.amount || 0), 0),
    }));

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / reviews.length
      : 0;

    const recentBookings = bookings.slice(0, 5).map(b => ({
      id: String((b as any)._id),
      status: b.status,
      amount: b.amount,
      createdAt: (b as any).createdAt,
      eventType: (b.eventDetails as any)?.type || 'Event',
    }));

    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = bookings
      .filter(b => ['accepted', 'confirmed'].includes(b.status) && ((b.eventDetails as any)?.date ?? '') >= today)
      .slice(0, 5)
      .map(b => ({
        id: String((b as any)._id),
        eventType: (b.eventDetails as any)?.type || 'Event',
        date: (b.eventDetails as any)?.date || '',
        location: (b.eventDetails as any)?.location || '',
        guests: (b.eventDetails as any)?.guests || 0,
        status: b.status,
        amount: b.amount || 0,
      }));

    return {
      totalBookings: bookings.length,
      revenue,
      pendingBookings: pendingCount,
      averageRating,
      recentBookings,
      monthlyRevenue,
      upcomingEvents,
    };
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

