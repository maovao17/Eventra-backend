import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private sanitize(doc: any) {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    return obj;
  }

  async create(dto: CreateUserDto) {
    try {
      const existingUser = await this.userModel.findOne({ userId: dto.userId }).exec();
      if (existingUser) {
        existingUser.name = dto.name;
        existingUser.phoneNumber = dto.phoneNumber;
        existingUser.role = dto.role;
        existingUser.businessName = dto.businessName;
        existingUser.profile_photo = dto.profile_photo;
        await existingUser.save();
        return this.sanitize(existingUser);
      }

      const createUser = await this.userModel.create(dto);
      return this.sanitize(createUser);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`Phone number already exists.`);
      }
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async findAll(limit = 20, offset = 0, filters: Record<string, any> = {}) {
    const users = await this.userModel
      .find(filters)
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    return users.map((u) => this.sanitize(u));
  }

  async findById(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('User not found');
    const userbyId = await this.userModel.findById(id).exec();
    if (!userbyId) throw new NotFoundException('User not found');
    return this.sanitize(userbyId);
  }

  async findByPhone(phone_number: string) {
    return this.userModel.findOne({ phoneNumber: phone_number }).exec();
  }

  async findByUserId(userId: string) {
    const user = await this.userModel.findOne({ userId }).exec();
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('User not found');
    try {
      const updateUser = await this.userModel
        .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
        .exec();
      if (!updateUser) throw new NotFoundException('User not found');
      return this.sanitize(updateUser);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`Phone number already exists.`);
      }
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('User not found');
    const deleteUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleteUser) throw new NotFoundException('User not found');
    return this.sanitize(deleteUser);
  }
}
