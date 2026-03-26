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
import { Event, EventDocument } from '../event/schemas/event.schema';

@Injectable()
export class BookingService {
  private readonly validTransitions = {
    pending: ["accepted", "rejected", "cancelled"],
    accepted: ["confirmed", "rejected", "cancelled"],
    rejected: [],
    confirmed: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  async create(dto: CreateBookingDto) {
    const booking = await this.bookingModel.create({
      ...dto,
      amount: dto.amount ?? dto.price ?? 0,
      price: dto.price ?? dto.amount ?? 0,
      status: (dto as any).status ?? 'pending',
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

    const [vendor, event] = await Promise.all([
      this.vendorModel.findById(dto.vendorId).exec(),
      this.eventModel.findById(dto.eventId).exec(),
    ]);

    const booking = await this.create({
      ...dto,
      amount: dto.amount ?? vendor?.price ?? 0,
      price: dto.price ?? vendor?.price ?? 0,
      date: dto.date ?? event?.eventDate ?? (event?.date ? new Date(event.date).toISOString() : ''),
      location:
        dto.location ??
        String(
          event?.location?.label ??
          event?.location?.address ??
          '',
      ),
      eventType: dto.eventType ?? event?.eventType ?? '',
      guests: dto.guests ?? Number(event?.guestCount ?? 0),
      status: 'accepted',
    } as any);

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

    if (booking.status === 'accepted') {
      return booking;
    }

    if (booking.status === 'rejected' || booking.status === 'cancelled') {
      throw new BadRequestException('Rejected/cancelled bookings cannot be accepted');
    }

    const newStatus = 'accepted';
    const currentStatus = booking.status;
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
      console.warn("Invalid transition:", currentStatus, "→", newStatus);
      return booking;
    }

    booking.status = newStatus;
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

    if (booking.status === 'rejected') {
      return booking;
    }

    if (booking.status === 'confirmed' || booking.status === 'completed') {
      throw new BadRequestException('Confirmed/completed bookings cannot be rejected');
    }

    const newStatus = 'rejected';
    const currentStatus = booking.status;
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
      console.warn("Invalid transition:", currentStatus, "→", newStatus);
      return booking;
    }

    booking.status = newStatus;
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

    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Only confirmed bookings can be completed');
    }

    const newStatus = 'completed';
    const currentStatus = booking.status;
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
      console.warn("Invalid transition:", currentStatus, "→", newStatus);
      return booking;
    }

    booking.status = newStatus;
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

  async markPayoutPaid(id: string) {
    return this.bookingModel.findByIdAndUpdate(
      id,
      { payoutStatus: "paid" },
      { new: true }
    );
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
