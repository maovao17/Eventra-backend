import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UserService } from '../user/user.service';
import { Vendor, VendorDocument } from '../vendor/schemas/vendor.schema';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  async create(dto: CreateBookingDto) {
    const booking = await this.bookingModel.create({
      ...dto,
      amount: dto.amount ?? dto.price ?? 0,
      price: dto.price ?? dto.amount ?? 0,
      status: 'pending',
      paymentStatus: 'pending',
      eventDetails: {
        type: dto.eventType ?? '',
        date: dto.date ?? '',
        time: dto.time ?? '',
        location: dto.location ?? '',
        guests: Number(dto.guests ?? 0),
      },
      completionImages: [],
    });
    return booking;
  }

  async createFromRequest(dto: CreateBookingDto) {
    const existingBooking = await this.bookingModel.findOne({ requestId: dto.requestId }).exec();
    if (existingBooking) {
      return existingBooking;
    }

    const booking = await this.create({ ...dto, status: 'pending' } as any);

    await this.notificationService.create({
      userId: dto.customerId,
      type: 'new-booking-request',
      message: 'Your vendor request was accepted. Complete payment to confirm booking.',
    });

    await this.notificationService.create({
      vendorId: dto.vendorId,
      type: 'new-booking-request',
      message: 'New booking request is awaiting your response.',
    });

    return booking;
  }

  async findAll() {
    return this.bookingModel.find().exec();
  }

  async findById(id: string) {
    const value = await this.bookingModel.findById(id).exec();
    if (!value) throw new NotFoundException('Booking not found');
    return value;
  }

  async findByUser(customerId: string) {
    return this.bookingModel.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  async findByVendor(vendorId: string) {
    return this.bookingModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
  }

  async findByRequestId(requestId: string) {
    return this.bookingModel.findOne({ requestId }).exec();
  }

  async update(id: string, dto: UpdateBookingDto) {
    const updated = await this.bookingModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async accept(id: string, actorUserId?: string) {
    const booking = await this.findById(id);
    await this.validateVendorActor(actorUserId, booking.vendorId);

    if (booking.status === 'rejected' || booking.status === 'cancelled') {
      throw new BadRequestException('Rejected/cancelled bookings cannot be accepted');
    }

    booking.status = 'accepted';
    await booking.save();

    await this.notificationService.create({
      userId: booking.customerId,
      type: 'booking-accepted',
      message: 'Your booking request has been accepted by the vendor.',
    });

    return booking;
  }

  async reject(id: string, actorUserId?: string) {
    const booking = await this.findById(id);
    await this.validateVendorActor(actorUserId, booking.vendorId);

    if (booking.status === 'confirmed' || booking.status === 'completed') {
      throw new BadRequestException('Confirmed/completed bookings cannot be rejected');
    }

    booking.status = 'rejected';
    await booking.save();

    await this.notificationService.create({
      userId: booking.customerId,
      type: 'booking-rejected',
      message: 'Your booking request was rejected by the vendor.',
    });

    return booking;
  }

  async complete(id: string, actorUserId?: string) {
    const booking = await this.findById(id);
    await this.validateVendorActor(actorUserId, booking.vendorId);

    if (booking.status !== 'confirmed' && booking.status !== 'accepted') {
      throw new BadRequestException('Only accepted/confirmed bookings can be completed');
    }

    booking.status = 'completed';
    await booking.save();

    await this.notificationService.create({
      userId: booking.customerId,
      type: 'booking-completed',
      message: 'Your event service is marked as completed. You can now leave a review.',
    });

    return booking;
  }

  async uploadCompletionProof(id: string, imageUrl: string, actorUserId?: string) {
    const booking = await this.findById(id);
    await this.validateVendorActor(actorUserId, booking.vendorId);
    booking.completionImages = booking.completionImages ?? [];
    booking.completionImages.push(imageUrl);
    await booking.save();
    return booking;
  }

  async remove(id: string) {
    const deleted = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Booking not found');
    return deleted;
  }

  private async validateVendorActor(actorUserId: string | undefined, vendorId: string) {
    if (!actorUserId) {
      throw new BadRequestException('actorUserId is required');
    }

    const actor = await this.userService.findByUserId(actorUserId);
    if (actor.role !== 'vendor') {
      throw new ForbiddenException('Only vendors can update booking status');
    }

    const vendor = await this.vendorModel.findOne({ userId: actorUserId }).exec();
    if (!vendor || String(vendor._id) !== String(vendorId)) {
      throw new ForbiddenException('Vendors can only manage their own bookings');
    }
  }
}
