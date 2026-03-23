import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Controller('payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(@Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutService.create(createPayoutDto);
  }

  @Get()
  findAll(@Query('vendorId') vendorId?: string) {
    if (vendorId) return this.payoutService.findByVendor(vendorId);
    return this.payoutService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.payoutService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayoutDto: any) {
    return this.payoutService.update(id, updatePayoutDto);
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.payoutService.markAsPaid(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payoutService.remove(id);
  }
}