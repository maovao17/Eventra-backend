import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>) {}

  private sanitize(doc: any) {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return obj;
  }

  async create(dto: CreateVendorDto) {
    try {
      const created = await this.vendorModel.create(dto as any);
      return this.sanitize(created);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Email or phone already exists.');
      }
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async findAll(limit = 20, offset = 0) {
    const vendors = await this.vendorModel
      .find()
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return vendors.map((v) => this.sanitize(v));
  }

  async findById(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Vendor not found');
    const vendor = await this.vendorModel.findById(id).exec();
    if (!vendor) throw new NotFoundException('Vendor not found');
    return this.sanitize(vendor);
  }

  async update(id: string, dto: UpdateVendorDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('Vendor not found');
    try {
      const updated = await this.vendorModel
        .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
        .exec();
      if (!updated) throw new NotFoundException('Vendor not found');
      return this.sanitize(updated);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Email or phone already exists.');
      }
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Vendor not found');
    const deleted = await this.vendorModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Vendor not found');
    return this.sanitize(deleted);
  }

  async verify(id: string, isVerified: boolean) {
    if (!isValidObjectId(id)) throw new NotFoundException('Vendor not found');
    const updated = await this.vendorModel
      .findByIdAndUpdate(id, { isVerified }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Vendor not found');
    return this.sanitize(updated);
  }
}
