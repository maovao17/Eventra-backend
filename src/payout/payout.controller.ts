import {
  ForbiddenException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { VendorService } from '../vendor/vendor.service';

@Controller('payouts')
export class PayoutController {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly vendorService: VendorService,
  ) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutService.create(createPayoutDto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get()
  async findAll(@Req() req, @Query('vendorId') vendorId?: string) {
    if (req.user.role === 'admin') {
      if (vendorId) return this.payoutService.findByVendor(vendorId);
      return this.payoutService.findAll();
    }

    const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
    return this.payoutService.findByVendor(String(vendor._id));
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get('vendor')
  async findByVendorUser(@Req() req) {
    const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
    return this.payoutService.findByVendor(String(vendor._id));
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get('event/:eventId')
  async findByEvent(@Req() req, @Param('eventId') eventId: string) {
    const payouts = await this.payoutService.findByEvent(eventId);

    if (req.user.role === 'admin') {
      return payouts;
    }

    const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
    return payouts.filter(
      (payout) => String(payout.vendorId) === String(vendor._id),
    );
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const payout = await this.payoutService.findOne(id);

    if (req.user.role === 'admin') {
      return payout;
    }

    const vendor = await this.vendorService.findByUserIdOrThrow(req.user.uid);
    if (String(payout.vendorId) !== String(vendor._id)) {
      throw new ForbiddenException('You do not have access to this payout');
    }

    return payout;
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayoutDto: any) {
    return this.payoutService.update(id, updatePayoutDto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payoutService.remove(id);
  }
}
