import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer')
  @Post()
  create(@Req() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create({
      ...createReviewDto,
      customerId: req.user.uid,
      userId: req.user.uid,
    });
  }

  @Get()
  findAll(
    @Query('vendorId') vendorId?: string,
    @Query('bookingId') bookingId?: string,
  ) {
    if (bookingId) {
      return this.reviewService.findByBooking(bookingId);
    }

    if (vendorId) {
      return this.reviewService.findByVendor(vendorId);
    }

    return this.reviewService.findAll();
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Post('reply')
  reply(
    @Req() req,
    @Body()
    payload: {
      reviewId?: string;
      actorUserId?: string;
      reply?: string;
    },
  ) {
    return this.reviewService.reply(
      payload.reviewId,
      req.user.uid,
      payload.reply,
    );
  }
}
