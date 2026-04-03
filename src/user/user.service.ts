import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Vendor, VendorDocument } from '../vendor/schemas/vendor.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';
import { Request, RequestDocument } from '../request/schemas/request.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
  ) {}

  private getAdminEmail() {
    return process.env.ADMIN_EMAIL?.trim().toLowerCase() || '';
  }

  private isAdminEmail(email?: string) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const adminEmail = this.getAdminEmail();
    return Boolean(adminEmail) && normalizedEmail === adminEmail;
  }

  private resolvePersistedRole(dto: CreateUserDto) {
    if (this.isAdminEmail(dto.email)) {
      return 'admin' as const;
    }

    return dto.role === 'vendor' ? 'vendor' : 'customer';
  }

  private sanitize(doc: unknown): UserDocument {
    if (!doc) throw new NotFoundException('User not found');
    const obj = (doc as { toObject?: () => unknown }).toObject
      ? (doc as { toObject: () => unknown }).toObject()
      : doc;
    return obj as UserDocument;
  }

  async create(dto: CreateUserDto) {
    try {
      if (dto.role === 'admin') {
        throw new ForbiddenException('Admin role cannot be self-assigned');
      }

      if (dto.authProvider === 'google') {
        if (!dto.email) {
          throw new BadRequestException('email is required for Google users');
        }
        dto.email = dto.email.toLowerCase();
        dto.phoneNumber = undefined;
      }

      if (dto.authProvider === 'phone') {
        if (!dto.phoneNumber) {
          throw new BadRequestException(
            'phoneNumber is required for phone users',
          );
        }
        dto.email = dto.email?.toLowerCase();
      }

      const persistedRole = this.resolvePersistedRole(dto);

      const existingUser = await this.userModel
        .findOne({ userId: dto.userId })
        .exec();
      if (existingUser) {
        existingUser.name = dto.name;
        existingUser.phoneNumber = dto.phoneNumber;
        existingUser.email = dto.email?.toLowerCase();
        existingUser.authProvider = dto.authProvider;
        existingUser.role = persistedRole;
        existingUser.businessName = dto.businessName;
        existingUser.profile_photo = dto.profile_photo;
        await existingUser.save();
        return this.sanitize(existingUser);
      }

      if (dto.email) {
        const existingEmailUser = await this.userModel
          .findOne({ email: dto.email.toLowerCase() })
          .exec();

        if (existingEmailUser) {
          throw new ConflictException('Email already exists.');
        }
      }

      if (dto.phoneNumber) {
        const existingPhoneUser = await this.userModel
          .findOne({ phoneNumber: dto.phoneNumber })
          .exec();

        if (existingPhoneUser) {
          throw new ConflictException('Phone number already exists.');
        }
      }

      const createUser = await this.userModel.create({
        ...dto,
        role: persistedRole,
      });
      return this.sanitize(createUser);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`User already exists.`);
      }
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  async findAll(limit = 20, offset = 0, filters: Record<string, unknown> = {}) {
    const users = await this.userModel
      .find(filters as Record<string, unknown>)
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

  async assertVendorCanAccessUser(
    vendorUserId: string,
    targetUserId: string,
  ) {
    if (vendorUserId === targetUserId) {
      return this.findByUserId(targetUserId);
    }

    const vendor = await this.vendorModel.findOne({ userId: vendorUserId }).exec();
    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }

    const [bookingRelationship, requestRelationship] = await Promise.all([
      this.bookingModel
        .exists({
          vendorId: String(vendor._id),
          customerId: targetUserId,
        })
        .exec(),
      this.requestModel
        .exists({
          vendorId: String(vendor._id),
          customerId: targetUserId,
        })
        .exec(),
    ]);

    if (!bookingRelationship && !requestRelationship) {
      throw new ForbiddenException(
        'Vendors can only access users linked to their bookings or requests',
      );
    }

    return this.findByUserId(targetUserId);
  }

  async update(id: string, dto: UpdateUserDto) {
    if (!isValidObjectId(id)) throw new NotFoundException('User not found');
    try {
      const updateUser = await this.userModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .exec();
      if (!updateUser) throw new NotFoundException('User not found');
      return this.sanitize(updateUser);
    } catch (err: unknown) {
      const error = err as { code?: number; name?: string; message?: string }
      if (error.code === 11000) {
        throw new ConflictException(`User already exists.`)
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message || 'Invalid user update')
      }
      throw err
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('User not found');
    const deleteUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleteUser) throw new NotFoundException('User not found');
    return this.sanitize(deleteUser);
  }
}
