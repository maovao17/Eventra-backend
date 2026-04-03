import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  private normalizeLocation(location: unknown) {
    if (!location) {
      return {};
    }

    if (typeof location === 'string') {
      return { label: location };
    }

    if (typeof location === 'object' && !Array.isArray(location)) {
      return location;
    }

    return {};
  }

  async create(dto: CreateEventDto) {
    const eventDate = dto.eventDate ?? dto.date;
    if (!eventDate) {
      throw new BadRequestException('eventDate is required');
    }

    const parsedDate = new Date(eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid event date');
    }

    const createdEvent = new this.eventModel({
      customerId: dto.customerId,
      name: dto.name,
      date: parsedDate,
      eventDate,
      eventType: dto.eventType ?? 'Custom',
      location: this.normalizeLocation(dto.location),
      status: dto.status ?? 'draft',
      budget: Number(dto.budget),
      guestCount: Number(dto.guestCount ?? 0),
      coverImage: dto.coverImage ?? '',
      services: dto.services ?? [],
    });

    return createdEvent.save();
  }

  async findAll() {
    return this.eventModel.find().exec();
  }

  async findById(id: string) {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findByUser(userId: string) {
    return this.eventModel.find({ customerId: userId }).exec();
  }

  async update(id: string, dto: UpdateEventDto) {
    const updatePayload: Record<string, any> = { ...dto };

    if (dto.eventDate) {
      const parsedDate = new Date(dto.eventDate);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid event date');
      }
      updatePayload.date = parsedDate;
    }

    if (dto.location !== undefined) {
      updatePayload.location = this.normalizeLocation(dto.location);
    }

    const updated = await this.eventModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Event not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Event not found');
    return deleted;
  }
}
