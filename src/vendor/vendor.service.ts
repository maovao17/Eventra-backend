import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
import { Request, RequestDocument } from '../request/schemas/request.schema';
import { Service, ServiceDocument } from '../service/schemas/service.schema';
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

    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,

    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,

    private readonly userService: UserService,
  ) {}

  // =========================
  // 🔹 BASIC PROFILE
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
        servicesOffered: [],
        portfolio: [],
        kycDocs: [],
        rating: 0,
      });
    }

    return vendor;
  }

  async getVendorMe(userId: string) {
    return this.getOrCreateVendorProfile(userId);
  }

  async updateVendorMe(userId: string, dto: UpdateVendorDto) {
    const vendor = await this.getOrCreateVendorProfile(userId);

    Object.assign(vendor, dto);

    await vendor.save();

    return vendor;
  }

  // =========================
  // 🔹 DASHBOARD (FIXED)
  // =========================

  async getDashboard(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const vendorId = String(vendor._id);

    const bookings = await this.bookingModel.find({ vendorId });

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

    const revenue = bookings
      .filter((b) => ['accepted', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + (b.amount || b.price || 0), 0);

    const now = new Date();

    const monthlyRevenue = bookings
      .filter((b) => {
        const d = new Date(b.createdAt);
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
  }

  // =========================
  // 🔹 BOOKINGS
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

  // =========================
  // 🔹 REVIEWS
  // =========================

  async getVendorReviews(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId });

    return this.reviewModel.find({ vendorId: vendor._id });
  }



  async getVendorNotifications(userId: string) {
    const vendor = await this.vendorModel.findOne({ userId });

    return this.notificationModel.find({ vendorId: vendor._id });
  }

  async markVendorNotificationRead(userId: string, id: string) {
    const notif = await this.notificationModel.findById(id);

    if (!notif) throw new NotFoundException();

    notif.read = true;
    await notif.save();

    return notif;
  }
}