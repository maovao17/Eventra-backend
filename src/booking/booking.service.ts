import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UserService } from '../user/user.service';
import { RequestService } from '../request/request.service';
import { EventsGateway } from '../events/events.gateway';
import { Vendor, VendorDocument } from '../vendor/schemas/vendor.schema';
import { NotificationService } from '../notification/notification.service';
import { Event, EventDocument } from '../event/schemas/event.schema';

type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

@Injectable()
export class BookingService {
  private readonly validTransitions: Record<BookingStatus, BookingStatus[]> = {
    pending: ['accepted', 'rejected', 'cancelled'],
    accepted: ['confirmed', 'rejected', 'cancelled'],
    rejected: [],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private userService: UserService,
    @Inject(forwardRef(() => RequestService))
    private requestService: RequestService,
    private notificationService: NotificationService,
    private eventsGateway: EventsGateway,
  ) { }

  private normalizeDate(value?: string) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  private areSameDay(dateA: Date, dateB: Date) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  private async isVendorAvailable(vendorId: string, date?: string) {
    if (!date) return true;
    const vendor = await this.vendorModel.findById(vendorId).exec();
    if (!vendor) return true;

    const normalizedDate = this.normalizeDate(date);
    if (!normalizedDate) return true;

    const blockedDates = Array.isArray((vendor as any).availability?.blockedDates)
      ? (vendor as any).availability.blockedDates.map((item: string) =>
        this.normalizeDate(String(item)),
      )
      : [];

    return !blockedDates.some(
      (blocked) => blocked && this.areSameDay(blocked, normalizedDate),
    );
  }

  private async reserveVendorDate(vendorId: string, date?: string) {
    if (!date) return;
    const normalizedDate = this.normalizeDate(date);
    if (!normalizedDate) return;

    const vendor = await this.vendorModel.findById(vendorId).exec();
    if (!vendor) return;

    const dates = Array.isArray((vendor as any).availability?.blockedDates)
      ? (vendor as any).availability.blockedDates.map((item: string) =>
        this.normalizeDate(String(item)),
      )
      : [];

    if (
      dates.some(
        (blocked) => blocked && this.areSameDay(blocked, normalizedDate),
      )
    ) {
      return;
    }

    (vendor as any).availability = (vendor as any).availability || {};
    (vendor as any).availability.blockedDates = [
      ...(Array.isArray((vendor as any).availability.blockedDates)
        ? (vendor as any).availability.blockedDates
        : []),
      normalizedDate,
    ];

    await vendor.save();
  }

  async create(dto: CreateBookingDto) {
    if (!dto.requestId) {
      throw new BadRequestException(
        'Booking must be created from an existing request',
      );
    }

    const request = await this.requestService.findOne(dto.requestId);
    if (request.status !== 'accepted') {
      throw new BadRequestException(
        'Booking can only be created for accepted requests',
      );
    }

    const existingBooking = await this.bookingModel
      .findOne({ requestId: dto.requestId })
      .exec();
    if (existingBooking) {
      return existingBooking;
    }

    const booking = await this.bookingModel.create({
      ...dto,
      amount: dto.amount ?? dto.price ?? 0,
      price: dto.price ?? dto.amount ?? 0,
      status: dto.status ?? 'pending',
      paymentStatus: 'pending',
      payoutStatus: 'pending',
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
    const existingBooking = await this.bookingModel
      .findOne({ requestId: dto.requestId })
      .exec();
    if (existingBooking) {
      return existingBooking;
    }

    const [vendor, event] = await Promise.all([
      this.vendorModel.findById(dto.vendorId).exec(),
      this.eventModel.findById(dto.eventId).exec(),
    ]);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const eventDate =
      dto.date ??
      event?.eventDate ??
      (event?.date ? new Date(event.date).toISOString() : '');

    if (!(await this.isVendorAvailable(dto.vendorId, eventDate))) {
      throw new BadRequestException(
        'Vendor is unavailable for the selected date. Please choose another date or vendor.',
      );
    }

    const booking = await this.create({
      ...dto,
      amount: dto.amount ?? (vendor as any).price ?? 0,
      price: dto.price ?? (vendor as any).price ?? 0,
      date: eventDate,
      location:
        dto.location ??
        String(event?.location?.label ?? event?.location?.address ?? ''),
      eventType: dto.eventType ?? event?.eventType ?? '',
      guests: dto.guests ?? Number(event?.guestCount ?? 0),
      status: 'accepted',
    } as CreateBookingDto);

    await this.reserveVendorDate(dto.vendorId, booking.date);

    await this.notificationService.create({
      userId: dto.customerId,
      type: 'new-booking-request',
      message:
        'Your vendor request was accepted. Complete payment to confirm booking.',
      bookingId: String(booking._id),
    });

    await this.notificationService.create({
      vendorId: dto.vendorId,
      type: 'new-booking-request',
      message: 'New booking request is awaiting your response.',
      bookingId: String(booking._id),
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
    return this.bookingModel
      .find({ customerId })
      .lean()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByVendor(vendorId: string) {
    console.log(`[findByVendor] querying vendorId="${vendorId}"`);
    const results = await this.bookingModel
      .find({ vendorId })
      .lean()
      .sort({ createdAt: -1 })
      .exec();
    console.log(`[findByVendor] found ${results.length} bookings`);
    if (results.length === 0) {
      const sample = await this.bookingModel
        .find({})
        .select('vendorId customerId requestId status')
        .lean()
        .limit(10)
        .exec();
      console.log(`[findByVendor] sample bookings in DB:`, JSON.stringify(sample));
    }
    return results;
  }

  async findByVendorUser(actorUserId: string) {
    const vendor = await this.vendorModel
      .findOne({ userId: actorUserId })
      .lean()
      .exec();
    if (!vendor) return [];
    return this.findByVendor(String((vendor as any)._id));
  }

  async findByRequestId(requestId: string) {
    return this.bookingModel.findOne({ requestId }).exec();
  }

  async assertVendorOwnership(id: string, actorUserId: string) {
    const booking = await this.findById(id);
    await this.validateVendorActor(actorUserId, booking.vendorId);
    return booking;
  }

  async update(
    id: string,
    dto: UpdateBookingDto & {
      paymentStatus?: 'pending' | 'partial' | 'paid';
      payoutStatus?: 'pending' | 'paid';
    },
  ) {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
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
      throw new BadRequestException(
        'Rejected/cancelled bookings cannot be accepted',
      );
    }

    const newStatus: BookingStatus = 'accepted';
    const currentStatus = booking.status as BookingStatus;
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
      return booking;
    }

    if (!(await this.isVendorAvailable(booking.vendorId, booking.date))) {
      throw new BadRequestException(
        'Vendor is unavailable for the selected date. Please choose another date or vendor.',
      );
    }

    booking.status = newStatus;
    await booking.save();
    await this.reserveVendorDate(booking.vendorId, booking.date);

    await this.notificationService.create({
      userId: booking.customerId,
      type: 'booking-accepted',
      message: 'Your booking request has been accepted by the vendor.',
      bookingId: String(booking._id),
    });

    this.eventsGateway.broadcastBookingUpdate({
      bookingId: String(booking._id),
      status: 'accepted',
      vendorId: booking.vendorId,
      vendorUserId: actorUserId,
      customerId: booking.customerId,
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
      throw new BadRequestException(
        'Confirmed/completed bookings cannot be rejected',
      );
    }

    const newStatus: BookingStatus = 'rejected';
    const currentStatus = booking.status as BookingStatus;
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
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

    const newStatus: BookingStatus = 'completed';
    const currentStatus = booking.status as BookingStatus;
    if (!this.validTransitions[currentStatus]?.includes(newStatus)) {
      return booking;
    }

    booking.status = newStatus;
    await booking.save();

    await this.notificationService.create({
      userId: booking.customerId,
      type: 'booking-completed',
      message:
        'Your event service is marked as completed. You can now leave a review.',
      bookingId: String(booking._id),
    });

    this.eventsGateway.broadcastBookingUpdate({
      bookingId: String(booking._id),
      status: 'completed',
      vendorId: booking.vendorId,
      vendorUserId: actorUserId,
      customerId: booking.customerId,
    });

    return booking;
  }

  async uploadCompletionProof(
    id: string,
    imageUrl: string,
    actorUserId?: string,
  ) {
    const booking = await this.findById(id);
    await this.validateVendorActor(actorUserId, booking.vendorId);
    booking.completionImages = booking.completionImages ?? [];
    booking.completionImages.push(imageUrl);
    await booking.save();

    await this.notificationService.create({
      userId: booking.customerId,
      vendorId: booking.vendorId,
      bookingId: String(booking._id),
      type: 'proof-uploaded',
      message:
        'Your vendor has uploaded service completion proof for your event.',
    });

    return booking;
  }

  async markPayoutPaid(
    id: string,
    actorRole: 'customer' | 'vendor' | 'admin' | string = 'admin',
  ) {
    if (actorRole !== 'admin') {
      throw new ForbiddenException('Only admin can mark payout as paid');
    }

    return this.bookingModel.findByIdAndUpdate(
      id,
      { payoutStatus: 'paid' },
      { new: true },
    );
  }

  async remove(id: string) {
    const deleted = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Booking not found');
    return deleted;
  }

  private async validateVendorActor(
    actorUserId: string | undefined,
    vendorId: string,
  ) {
    if (!actorUserId) {
      throw new BadRequestException('actorUserId is required');
    }

    const actor = await this.userService.findByUserId(actorUserId);
    if (actor.role !== 'vendor') {
      throw new ForbiddenException('Only vendors can update booking status');
    }
    if (actor.status !== 'approved') {
      throw new ForbiddenException('Vendor account not approved');
    }

    const vendor = await this.vendorModel
      .findOne({ userId: actorUserId })
      .exec();
    if (!vendor || String((vendor as any)._id) !== String(vendorId)) {
      throw new ForbiddenException(
        'Vendors can only manage their own bookings',
      );
    }
  }
}
