import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { UpdateVendorDto } from './dto/update-vendor.dto';

import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
import { Request, RequestDocument } from '../request/schemas/request.schema';
import { Review, ReviewDocument } from '../review/schemas/review.schema';
import {
  Notification,
  NotificationDocument,
} from '../notification/schemas/notification.schema';

import { UserService } from '../user/user.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,

    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,

    @InjectModel(Request.name)
    private readonly requestModel: Model<RequestDocument>,

    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,

    private readonly userService: UserService,
  ) { }

  // =========================
  // ✅ CREATE
  // =========================

  async create(dto: any) {
    return this.vendorModel.create(dto);
  }

  // =========================
  // ✅ GET / CREATE PROFILE
  // =========================

  async getOrCreateVendorProfile(userId: string): Promise<VendorDocument> {
    let vendor = await this.vendorModel.findOne({ userId });

    if (!vendor) {
      const user = await this.userService.findByUserId(userId);

      if (user.role !== 'vendor') {
        throw new ForbiddenException('Only vendors allowed');
      }

      vendor = await this.vendorModel.create({
        userId,
        name: user.name,
        businessName: user.name,
        description: '',
        category: [],
        services: [],
        portfolio: [],
        rating: 0,
      });
    }

    return vendor;
  }

  async getByUserId(userId: string) {
    return this.getOrCreateVendorProfile(userId);
  }

  // =========================
  // ✅ UPDATE PROFILE
  // =========================

  async updateByUserId(userId: string, dto: UpdateVendorDto) {
    const vendor = await this.getOrCreateVendorProfile(userId);

    Object.assign(vendor, dto);

    await vendor.save();

    return vendor;
  }

  // =========================
  // ✅ DASHBOARD (STABLE)
  // =========================

  async getDashboard(userId: string) {
    try {
      const vendor = await this.vendorModel.findOne({ userId });

      if (!vendor) {
        return this.emptyDashboard();
      }

      const vendorId = String(vendor?._id);

      const bookings = await this.bookingModel.find({ vendorId: vendorId || "" });

      const pendingRequests = await this.requestModel.countDocuments({
        vendorId,
        status: 'pending',
      });

      const pendingBookings = bookings.filter(
        (b) => b.status === 'pending',
      ).length;

      const completedBookings = bookings.filter(
        (b) => b.status === 'completed',
      ).length;

      const revenue = bookings.reduce(
        (sum, b) => sum + (b.amount || b.price || 0),
        0,
      );

      const now = new Date();

      const monthlyRevenue = bookings
        .filter((b) => {
          const d = new Date((b as any).createdAt || new Date());
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, b) => sum + (b.amount || b.price || 0), 0);

      return {
        totalBookings: bookings.length,
        pendingRequests,
        pendingBookings,
        completedBookings,
        revenue,
        monthlyRevenue,
        rating: vendor.rating || 0,
      };
    } catch (err) {
      console.error('Dashboard error:', err);
      return this.emptyDashboard();
    }
  }

  private emptyDashboard() {
    return {
      totalBookings: 0,
      pendingRequests: 0,
      pendingBookings: 0,
      completedBookings: 0,
      revenue: 0,
      monthlyRevenue: 0,
      rating: 0,
    };
  }

  // =========================
  // ✅ BOOKINGS
  // =========================

  async getVendorBookings(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId });

    if (!vendor) throw new NotFoundException();

    return this.bookingModel.find({ vendorId: vendor._id });
  }

  async updateVendorBookingStatus(
    userId: string,
    bookingId: string,
    status: string,
  ) {
    const vendor = await this.vendorModel.findOne({ userId });

    if (!vendor) throw new NotFoundException();

    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) throw new NotFoundException();

    booking.status = status;
    await booking.save();

    return booking;
  }



  async getVendorReviews(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId });

    return this.reviewModel.find({ vendorId: vendor?._id });
  }


  async getVendorNotifications(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId });

    return this.notificationModel.find({ vendorId: vendor?._id });
  }

  async markVendorNotificationRead(userId: string, id: string) {
    const notif = await this.notificationModel.findById(id);

    if (!notif) throw new NotFoundException();

    notif.read = true;
    await notif.save();

    return notif;
  }

  // =========================
  // 🔥 COMPATIBILITY METHODS (DO NOT REMOVE)
  // =========================

  // used in request.service
  async findOne(id: string) {
    return this.vendorModel.findById(id);
  }

  // used in multiple places
  async findByUserIdOrThrow(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  // already exists but re-exposed safely
  async findByUserId(userId: string) {
    return this.vendorModel.findOne({ userId });
  }

  // used in review.service
  async update(vendorId: string, data: any) {
    return this.vendorModel.findByIdAndUpdate(vendorId, data, { new: true });
  }

  // used in seed
  async findAll() {
    return this.vendorModel.find();
  }

  // admin panel
  async getPendingVendors() {
    return this.vendorModel.find({ status: 'pending' });
  }

  // admin approval
  async approveVendor(id: string) {
    return this.vendorModel.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true },
    );
  }

  // admin rejection
  async rejectVendor(id: string) {
    return this.vendorModel.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true },
    );
  }

  async getAllVendors() {
    return this.vendorModel.find({});
  }
}
