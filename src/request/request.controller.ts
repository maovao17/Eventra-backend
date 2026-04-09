import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { VendorService } from '../vendor/vendor.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type AuthenticatedUser = {
  uid: string
  role: 'customer' | 'vendor' | 'admin'
}

@Controller('requests')
export class RequestController {
  constructor(
    private readonly requestService: RequestService,
    private readonly vendorService: VendorService,
  ) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer')
  @Post()
  create(@Req() req: { user: AuthenticatedUser }, @Body() createRequestDto: CreateRequestDto) {
    return this.requestService.create({
      ...createRequestDto,
      customerId: req.user.uid,
    });
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Get('vendor')
  findForVendor(@Req() req: { user: AuthenticatedUser }) {
    return this.requestService.findByVendorUser(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get()
  async findAll(
    @Req() req: { user: AuthenticatedUser },
    @Query('eventId') eventId?: string,
    @Query('userId') userId?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    if (req.user.role === 'admin') {
      return this.requestService.findByQuery({
        customerId: userId,
        vendorId,
        eventId,
      });
    }

    if (req.user.role === 'vendor') {
      const vendor = await this.vendorService.findByUserId(req.user.uid);
      if (!vendor) {
        throw new NotFoundException('Vendor profile not found');
      }
      const ownVendorId = String((vendor as any)._id);

      if (vendorId && String(vendorId) !== ownVendorId) {
        throw new ForbiddenException(
          'You can only query your own vendor requests',
        );
      }

      const queryVendorId = vendorId || ownVendorId;

      if (eventId) {
        return this.requestService
          .findByQuery({ vendorId: queryVendorId, eventId })
          .then((requests) =>
            requests.map((request) => ({
              ...request.toObject(),
              vendor: vendor,
            })),
          );
      }

      return this.requestService.findByVendorUser(req.user.uid);
    }

    // customer
    if (userId && String(userId) !== String(req.user.uid)) {
      throw new ForbiddenException(
        'Customers can only query their own requests',
      );
    }

    const queryCustomerId = String(req.user.uid);

    if (vendorId || eventId) {
      return this.requestService.findByQuery({
        customerId: queryCustomerId,
        vendorId,
        eventId,
      });
    }

    return this.requestService.findByUser(queryCustomerId);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const request = await this.requestService.findOne(id);

    if (req.user.role === 'admin') {
      return request;
    }

    if (
      req.user.role === 'customer' &&
      String(request.customerId) === String(req.user.uid)
    ) {
      return request;
    }

    if (req.user.role === 'vendor') {
      const vendorRequests = await this.requestService.findByVendorUser(
        req.user.uid,
      );
      const allowedRequest = vendorRequests.find(
        (item) => String(item._id) === String(id),
      );
      if (allowedRequest) {
        return request;
      }
    }

    throw new ForbiddenException('You do not have access to this request');
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Patch(':id/accept')
  accept(@Req() req, @Param('id') id: string) {
    return this.requestService.accept(id, req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('vendor')
  @Patch(':id/reject')
  reject(@Req() req, @Param('id') id: string) {
    return this.requestService.reject(id, req.user.uid);
  }
}
