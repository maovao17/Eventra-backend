import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminGuard } from '../auth/admin.guard';

@Controller('payments')
@Throttle({ default: { limit: 20, ttl: 60000 } })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}


  
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer')
  @Post()
  create(
    @Req() req: { user: { uid: string } },
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.create({
      ...createPaymentDto,
      customerId: req.user.uid,
    });
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get()
  async findAll(
    @Req() req: { user: { uid: string; role: string } },
    @Query('userId') userId?: string,
    @Query('customerId') customerId?: string,
    @Query('bookingId') bookingId?: string,
  ) {
    if (req.user.role === 'admin') {
      const effectiveCustomerId = customerId ?? userId;
      if (effectiveCustomerId)
        return this.paymentService.findByCustomer(effectiveCustomerId);
      if (bookingId) return this.paymentService.findByBooking(bookingId);
      return this.paymentService.findAll();
    }

    if (req.user.role === 'customer') {
      return this.paymentService.findByCustomer(req.user.uid);
    }

    return this.paymentService.findByVendorUser(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get(':id')
  async findOne(
    @Req() req: { user: { uid: string; role: string } },
    @Param('id') id: string,
  ) {
    const payment = await this.paymentService.findOne(id);

    if (req.user.role === 'admin') {
      return payment;
    }

    if (
      req.user.role === 'customer' &&
      String(payment.customerId) === String(req.user.uid)
    ) {
      return payment;
    }

    return this.paymentService.assertVendorCanAccessPayment(id, req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: Partial<CreatePaymentDto>,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }

  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @Get('admin/revenue')
  getRevenue() {
    return this.paymentService.getRevenue();
  }

@UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer')
  @Post('create-order')
  async createOrder(
    @Req() req,
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentService.createRazorpayOrder(
      dto.bookingId,
      req.user.uid,
    );
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer')
  @Post('verify')
  async verify(
    @Req() req,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentService.verifyPayment(dto, req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer')
  @Get('me')
  findMyPayments(@Req() req) {
    return this.paymentService.findByCustomer(req.user.uid);
  }

  @Post('webhook')
  async webhook(
    @Req() req,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? JSON.stringify(req.body ?? {});
    return this.paymentService.processRazorpayWebhook(rawBody, signature);
  }
}
