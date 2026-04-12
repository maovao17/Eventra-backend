import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  private sanitize(doc: any) {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return obj;
  }

  async create(dto: CreateServiceDto) {
    try {
      const created = await this.serviceModel.create(dto as any);
      return this.sanitize(created);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Duplicate entry');
      }
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async findAll(limit = 20, offset = 0) {
    const items = await this.serviceModel
      .find()
      .populate('vendor_Id', 'businessName profileImage category')
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return items.map((i) => this.sanitize(i));
  }

  async findById(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Service not found');
    const item = await this.serviceModel.findById(id).exec();
    if (!item) throw new NotFoundException('Service not found');
    return this.sanitize(item);
  }

  async update(id: string, dto: UpdateServiceDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Service not found');
    try {
      const updated = await this.serviceModel
        .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
        .exec();
      if (!updated) throw new NotFoundException('Service not found');
      return this.sanitize(updated);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Duplicate entry');
      }
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Service not found');
    const deleted = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Service not found');
    return this.sanitize(deleted);
  }
}
