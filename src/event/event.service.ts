import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {}

  async create(dto: CreateEventDto) {
    try {
      console.log("RAW DTO:", dto);

      const parsed = {
        name: dto.name,
        date: new Date(dto.date), // 🔥 FIX DATE
        budget: Number(dto.budget), // 🔥 FIX NUMBER
        services: dto.services || []
      };

      console.log("PARSED DTO:", parsed);

      const createdEvent = new this.eventModel(parsed);

      const saved = await createdEvent.save();

      console.log("SAVED EVENT:", saved);

      return saved;
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);
      throw error;
    }
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
    console.log("UPDATE EVENT - ID:", id);
    console.log("UPDATE EVENT - DTO:", dto);
    console.log("UPDATE EVENT - Services type:", Array.isArray(dto.services) ? "array" : typeof dto.services);
    if (dto.services) {
      console.log("UPDATE EVENT - Services length:", dto.services.length);
      console.log("UPDATE EVENT - Services content:", dto.services);
    }

    const updated = await this.eventModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Event not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Event not found');
    return deleted;
  }
}
