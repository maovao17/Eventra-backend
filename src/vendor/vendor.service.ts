import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const vendor = new this.vendorModel(createVendorDto);
    return vendor.save();
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorModel.find().exec();
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorModel.findById(new Types.ObjectId(id)).exec();
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.vendorModel.findByIdAndUpdate(id, updateVendorDto, { new: true }).exec();
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.vendorModel.findByIdAndDelete(id).exec();
    if (!vendor) throw new NotFoundException('Vendor not found');
  }
}
