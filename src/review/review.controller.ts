import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  findAll(@Query('vendorId') vendorId?: string, @Query('bookingId') bookingId?: string) {
    if (bookingId) {
      return this.reviewService.findByBooking(bookingId);
    }

    if (vendorId) {
      return this.reviewService.findByVendor(vendorId);
    }

    return this.reviewService.findAll();
  }

  @Post('reply')
  reply(
    @Body()
    payload: {
      reviewId?: string;
      actorUserId?: string;
      reply?: string;
    },
  ) {
    return this.reviewService.reply(payload.reviewId, payload.actorUserId, payload.reply);
  }
}
