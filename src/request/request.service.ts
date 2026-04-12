import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, RequestDocument } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BookingService } from '../booking/booking.service';
import { UserService } from '../user/user.service';
import { VendorService } from '../vendor/vendor.service';
import { EventService } from '../event/event.service';
import { EventsGateway } from '../events/events.gateway';
import { Event, EventDocument } from '../event/schemas/event.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @Inject(forwardRef(() => BookingService))
    private bookingService: BookingService,
    private userService: UserService,
    @Inject(forwardRef(() => VendorService))
    private vendorService: VendorService,
    private eventService: EventService,
    private eventsGateway: EventsGateway,
  ) { }

  async create(createRequestDto: CreateRequestDto): Promise<RequestDocument> {
    const customer = await this.userService.findByUserId(
      createRequestDto.customerId,
    );
    if (customer.role !== 'customer') {
      throw new ForbiddenException('Only customers can create requests');
    }

    const vendor = await this.vendorService.findOne(createRequestDto.vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    if (!(vendor as any).isApproved) {
      throw new ForbiddenException('Vendor is not approved');
    }

    const event = await this.eventService.findById(createRequestDto.eventId);
    if (event.customerId !== createRequestDto.customerId) {
      throw new ForbiddenException(
        'Customers can only request vendors for their own events',
      );
    }

    const existingRequest = await this.requestModel
      .findOne({
        customerId: createRequestDto.customerId,
        vendorId: createRequestDto.vendorId,
        eventId: createRequestDto.eventId,
      })
      .exec();

    if (existingRequest) {
      throw new ConflictException(
        'A request already exists for this vendor and event',
      );
    }

    const createdRequest = new this.requestModel(createRequestDto);
    return createdRequest.save();
  }

  async findAll(): Promise<RequestDocument[]> {
    return this.requestModel.find().exec();
  }

  async findByUser(userId: string): Promise<RequestDocument[]> {
    return this.requestModel
      .find({ customerId: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByVendor(vendorId: string): Promise<RequestDocument[]> {
    return this.requestModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
  }

  async findByVendorUser(userId: string) {
    const vendor = await this.vendorService.findByUserIdOrThrow(userId);
    const vendorId = String((vendor as any)._id);
    const requests = await this.findByVendor(vendorId);
    if (!requests.length) {
      return [];
    }

    const eventIds = Array.from(
      new Set(requests.map((request) => String(request.eventId))),
    );
    const customerIds = Array.from(
      new Set(requests.map((request) => String(request.customerId))),
    );

    const [events, customers, bookings] = await Promise.all([
      this.eventModel.find({ _id: { $in: eventIds } }).lean().exec(),
      this.userModel.find({ userId: { $in: customerIds } }).lean().exec(),
      this.bookingModel
        .find({ requestId: { $in: requests.map((request) => String(request._id)) } })
        .lean()
        .exec(),
    ]);

    const eventsById = new Map(
      events.map((event) => [String((event as { _id: unknown })._id), event]),
    );
    const customersById = new Map(
      customers.map((customer) => [String(customer.userId), customer]),
    );
    const bookingsByRequestId = new Map(
      bookings.map((booking) => [String(booking.requestId), booking]),
    );

    return requests.map((request) => ({
      ...request.toObject(),
      event: eventsById.get(String(request.eventId)),
      customer: customersById.get(String(request.customerId)),
      booking: bookingsByRequestId.get(String(request._id)) ?? null,
    }));
  }

  async findByEvent(eventId: string): Promise<RequestDocument[]> {
    return this.requestModel.find({ eventId }).sort({ createdAt: -1 }).exec();
  }

  async findByQuery(filters: {
    customerId?: string;
    vendorId?: string;
    eventId?: string;
  }): Promise<RequestDocument[]> {
    const query: Record<string, string> = {};
    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.vendorId) query.vendorId = filters.vendorId;
    if (filters.eventId) query.eventId = filters.eventId;

    return this.requestModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<RequestDocument> {
    const request = await this.requestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async update(id: string, updateRequestDto: UpdateRequestDto) {
    if (updateRequestDto.status === 'accepted') {
      throw new BadRequestException("Use /accept endpoint");
    }

    if (updateRequestDto.status === 'rejected') {
      throw new BadRequestException("Use /reject endpoint");
    }
    const updatedRequest = await this.requestModel
      .findByIdAndUpdate(id, updateRequestDto, { new: true })
      .exec();

    if (!updatedRequest) throw new NotFoundException('Request not found');
    return updatedRequest;
  }

  async remove(id: string) {
    const request = await this.requestModel.findByIdAndDelete(id).exec();
    if (!request) throw new NotFoundException('Request not found');
    return request;
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
      throw new ForbiddenException('Only vendors can update request status');
    }
    if (actor.status !== 'approved') {
      throw new ForbiddenException('Vendor account not approved');
    }

    const vendor = await this.vendorService.findByUserId(actorUserId);
    if (!vendor || String((vendor as any)._id) !== String(vendorId)) {
      throw new ForbiddenException(
        'Vendors can only update their own requests',
      );
    }
  }

  async accept(id: string, actorUserIdFromToken: string) {
    const request = await this.findOne(id);
    await this.validateVendorActor(actorUserIdFromToken, request.vendorId);

    if (request.status === 'accepted') {
      const booking = await this.bookingService.findByRequestId(id);
      return { request, booking };
    }

    if (request.status === 'rejected') {
      throw new BadRequestException('Rejected requests cannot be accepted');
    }

    request.status = 'accepted';
    await request.save();

    const requestAmount = Number((request as any).amount ?? 0);
    const booking = await this.bookingService.createFromRequest({
      requestId: String(request._id),
      customerId: request.customerId,
      vendorId: request.vendorId,
      eventId: request.eventId,
      ...(requestAmount > 0 ? { amount: requestAmount, price: requestAmount } : {}),
    });
    const vendor = await this.vendorService.findOne(String(request.vendorId));

    this.eventsGateway.broadcastBookingUpdate({
      bookingId: String(booking._id),
      status: 'accepted',
      vendorId: booking.vendorId,
      vendorUserId: String((vendor as any)?.userId || ''),
      customerId: booking.customerId,
    });

    return { request, booking };
  }

  async reject(id: string, actorUserIdFromToken: string) {
    const request = await this.findOne(id);
    await this.validateVendorActor(actorUserIdFromToken, request.vendorId);

    if (request.status === 'rejected') {
      throw new BadRequestException('Rejected requests cannot be accepted');
    }

    request.status = 'rejected';
    await request.save();
    return request;
  }
}
