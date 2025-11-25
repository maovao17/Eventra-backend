import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomiseEvent, CustomiseEventDocument } from './schemas/customise-event.schema';
import { CreateCustomiseEventDto } from './dto/create-customise-event.dto';
import { UpdateCustomiseEventDto } from './dto/update-customise-event.dto';

@Injectable()
export class CustomiseEventService {
  constructor(
    @InjectModel(CustomiseEvent.name)
    private customiseEventModel: Model<CustomiseEventDocument>,
  ) {}

  create(createDto: CreateCustomiseEventDto) {
    const event = new this.customiseEventModel(createDto);
    return event.save();
  }

  findAll() {
    return this.customiseEventModel.find().populate('user_Id').exec();
  }

  async findOne(id: string) {
    const event = await this.customiseEventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, updateDto: UpdateCustomiseEventDto) {
    const updated = await this.customiseEventModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Event not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.customiseEventModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Event not found');
    return deleted;
  }
}
