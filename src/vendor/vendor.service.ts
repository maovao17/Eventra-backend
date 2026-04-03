import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AuthenticatedUser } from '../types/auth.types';
import { Service, ServiceDocument } from '../service/schemas/service.schema';

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

    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,

    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,

    @InjectModel(Request.name)
    private readonly requestModel: Model<RequestDocument>,

    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,

    private readonly userService: UserService,
  ) {}

  // =========================
  // ✅ CREATE
  // =========================

  async create(dto: any) {
    return this.vendorModel.create(dto);
  }

  async findPublic() {
    return this.vendorModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOneOrThrow(id: string) {
    const vendor = await this.vendorModel.findById(id).exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async findByServices(servicesQuery?: string) {
    const serviceTerms = String(servicesQuery || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const vendors = await this.findPublic();
    if (!serviceTerms.length) {
      return vendors;
    }

    return vendors.filter((vendor) => {
      const categoryTerms = Array.isArray(vendor.category)
        ? vendor.category.map((item) => String(item).toLowerCase())
        : [];
      const legacyServiceTerms = Array.isArray(vendor.services)
        ? vendor.services.map((item) => String(item?.name || '').toLowerCase())
        : [];

      return serviceTerms.some((term) =>
        [...categoryTerms, ...legacyServiceTerms].some((value) =>
          value.includes(term),
        ),
      );
    });
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
        businessName: user.businessName || user.name,
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
    const vendor = await this.getOrCreateVendorProfile(userId);
    return this.withDerivedAvailability(vendor);
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

  async addPortfolioItems(userId: string, urls: string[]) {
    const vendor = await this.getOrCreateVendorProfile(userId);
    const existing = Array.isArray(vendor.portfolio) ? vendor.portfolio : [];
    const incoming = urls.map((url) => ({
      url,
      caption: '',
      category: '',
      uploadedAt: new Date(),
    }));

    vendor.portfolio = [...existing, ...incoming];
    vendor.gallery = [
      ...(Array.isArray(vendor.gallery) ? vendor.gallery : []),
      ...urls,
    ];
    await vendor.save();
    return vendor;
  }

  async assignServices(userId: string, serviceIds: string[]) {
    const vendor = await this.getOrCreateVendorProfile(userId);
    vendor.servicesOffered = serviceIds as any;

    const services = serviceIds.length
      ? await this.serviceModel.find({ _id: { $in: serviceIds } }).exec()
      : [];

    vendor.services = services.map((service) => ({
      name: String(service.name),
      price: Number(service.price ?? 0),
      description: String(service.description ?? ''),
    })) as any;

    await vendor.save();
    return vendor;
  }

  async updateAvailability(
    userId: string,
    payload: {
      blockedDates?: string[];
      workingHours?: { start?: string; end?: string };
    },
  ) {
    const vendor = await this.getOrCreateVendorProfile(userId);
    const bookedDates = await this.getBookedDatesForVendor(String(vendor._id));
    const manuallyBlockedDates = Array.isArray(payload.blockedDates)
      ? payload.blockedDates.map((value) => new Date(value))
      : [];
    const mergedBlockedDates = Array.from(
      new Set(
        [...manuallyBlockedDates, ...bookedDates].map((value) =>
          new Date(value).toISOString().slice(0, 10),
        ),
      ),
    ).map((value) => new Date(value));

    vendor.availability = {
      blockedDates: mergedBlockedDates,
      workingHours: {
        start: payload.workingHours?.start || '09:00',
        end: payload.workingHours?.end || '18:00',
      },
    } as any;
    await vendor.save();
    return this.withDerivedAvailability(vendor);
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

      const bookings = await this.bookingModel.find({
        vendorId: vendorId || '',
      });

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
    } catch {
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
      {
        status: 'approved',
        isVerified: true,
        verified: true,
      },
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

  private async getBookedDatesForVendor(vendorId: string) {
    const bookings = await this.bookingModel
      .find({
        vendorId,
        status: { $in: ['confirmed', 'completed'] },
      })
      .exec();

    return bookings
      .map((booking) =>
        String(booking.date || booking.eventDetails?.date || ''),
      )
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()));
  }

  private async withDerivedAvailability(vendor: VendorDocument) {
    const bookedDates = await this.getBookedDatesForVendor(String(vendor._id));
    const manuallyBlocked = Array.isArray(vendor.availability?.blockedDates)
      ? vendor.availability.blockedDates
      : [];
    const mergedBlocked = Array.from(
      new Set(
        [...manuallyBlocked, ...bookedDates].map((value) =>
          new Date(value).toISOString().slice(0, 10),
        ),
      ),
    );

    const payload = vendor.toObject();
    payload.availability = {
      blockedDates: mergedBlocked,
      bookedDates: bookedDates.map((value) =>
        new Date(value).toISOString().slice(0, 10),
      ),
      workingHours: {
        start: vendor.availability?.workingHours?.start || '09:00',
        end: vendor.availability?.workingHours?.end || '18:00',
      },
    };

    return payload;
  }
}
