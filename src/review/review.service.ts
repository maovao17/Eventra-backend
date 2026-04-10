import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingService } from '../booking/booking.service';
import { UserService } from '../user/user.service';
import { VendorService } from '../vendor/vendor.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private bookingService: BookingService,
    private userService: UserService,
    @Inject(forwardRef(() => VendorService))
    private vendorService: VendorService,) { }

  async create(dto: CreateReviewDto) {
    const customerId = dto.customerId ?? dto.userId;
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    const customer = await this.userService.findByUserId(customerId);
    if (customer.role !== 'customer') {
      throw new ForbiddenException('Only customers can create reviews');
    }

    const booking = await this.bookingService.findById(dto.bookingId);
    if (
      booking.customerId !== customerId ||
      booking.vendorId !== dto.vendorId
    ) {
      throw new ForbiddenException('Review does not match booking ownership');
    }

    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BadRequestException(
        'Reviews are allowed only after confirmed/completed booking',
      );
    }

    const existingReview = await this.reviewModel
      .findOne({ bookingId: dto.bookingId })
      .exec();
    if (existingReview) {
      throw new ConflictException('A review already exists for this booking');
    }

    const review = await this.reviewModel.create({
      ...dto,
      customerId,
    });

    await this.refreshVendorRating(dto.vendorId);
    return review;
  }

  async reply(reviewId?: string, actorUserId?: string, reply?: string) {
    if (!reviewId || !actorUserId || !reply) {
      throw new BadRequestException(
        'reviewId, actorUserId and reply are required',
      );
    }

    const actor = await this.userService.findByUserId(actorUserId);
    if (actor.role !== 'vendor') {
      throw new ForbiddenException('Only vendors can reply to reviews');
    }

    const vendor = await this.vendorService.findByUserId(actorUserId);
    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }

    const reviewDoc = await this.reviewModel.findById(reviewId).exec();
    if (!reviewDoc) {
      throw new NotFoundException('Review not found');
    }

    if (String(reviewDoc.vendorId) !== String((vendor as any)._id)) {
      throw new ForbiddenException(
        'Vendors can only reply to their own reviews',
      );
    }

    reviewDoc.reply = reply;
    reviewDoc.replyBy = actorUserId;
    reviewDoc.repliedAt = new Date();
    await reviewDoc.save();
    return reviewDoc;
  }

  async findAll() {
    return this.reviewModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByVendor(vendorId: string) {
    return this.reviewModel.find({ vendorId }).sort({ createdAt: -1 }).exec();
  }

  async findByBooking(bookingId: string) {
    return this.reviewModel.findOne({ bookingId }).exec();
  }

  private async refreshVendorRating(vendorId: string) {
    const reviews = await this.reviewModel.find({ vendorId }).exec();
    if (!reviews.length) {
      await this.vendorService.update(vendorId, {
        rating: 0,
        totalReviews: 0,
      } as any);
      return;
    }

    const avg =
      reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      reviews.length;
    await this.vendorService.update(vendorId, {
      rating: Number(avg.toFixed(2)),
      totalReviews: reviews.length,
    } as any);
  }
}
