import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('customerId') customerId?: string, @Query('bookingId') bookingId?: string) {
    const effectiveCustomerId = customerId ?? userId;
    if (effectiveCustomerId) return this.paymentService.findByUser(effectiveCustomerId);
    if (bookingId) return this.paymentService.findByBooking(bookingId);
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: Partial<CreatePaymentDto>) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }

  @Get('admin/revenue')
  getRevenue() {
    return this.paymentService.getRevenue();
  }
}
