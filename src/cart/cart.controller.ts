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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Post()
  create(@Req() req, @Body() createCartDto: CreateCartDto) {
    return this.cartService.create({
      ...createCartDto,
      userId: req.user.role === 'admin' ? createCartDto.userId : req.user.uid,
    });
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Get()
  findAll(@Req() req, @Query('userId') userId?: string) {
    if (req.user.role === 'admin') {
      if (userId) return this.cartService.findByUser(userId);
      return this.cartService.findAll();
    }

    if (userId && userId !== req.user.uid) {
      throw new ForbiddenException('You do not have access to this cart');
    }

    if (userId) return this.cartService.findByUser(userId);
    return this.cartService.findByUser(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Get('user/:userId/event/:eventId')
  async findByUserAndEvent(
    @Req() req,
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
  ) {
    if (req.user.role !== 'admin' && userId !== req.user.uid) {
      throw new ForbiddenException('You do not have access to this cart');
    }

    return this.cartService.findByUserAndEvent(userId, eventId);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const cart = await this.cartService.findOne(id);

    if (
      req.user.role !== 'admin' &&
      String(cart.userId) !== String(req.user.uid)
    ) {
      throw new ForbiddenException('You do not have access to this cart');
    }

    return cart;
  }

  async assertCartAccess(req, id: string) {
    const cart = await this.cartService.findOne(id);
    if (
      req.user.role !== 'admin' &&
      String(cart.userId) !== String(req.user.uid)
    ) {
      throw new ForbiddenException('You do not have access to this cart');
    }
    return cart;
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    await this.assertCartAccess(req, id);
    return this.cartService.update(id, updateCartDto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Post(':userId/:eventId/add')
  addItem(
    @Req() req,
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
    @Body()
    body: {
      vendorId: string;
      serviceId: string;
      serviceName: string;
      price: number;
    },
  ) {
    const effectiveUserId = req.user.role === 'admin' ? userId : req.user.uid;
    if (req.user.role !== 'admin' && userId !== req.user.uid) {
      throw new ForbiddenException('You do not have access to this cart');
    }

    return this.cartService.addItem(
      effectiveUserId,
      eventId,
      body.vendorId,
      body.serviceId,
      body.serviceName,
      body.price,
    );
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Delete(':id/item/:itemIndex')
  async removeItem(
    @Req() req,
    @Param('id') id: string,
    @Param('itemIndex') itemIndex: number,
  ) {
    await this.assertCartAccess(req, id);
    return this.cartService.removeItem(id, itemIndex);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    await this.assertCartAccess(req, id);
    return this.cartService.remove(id);
  }
}
