import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) return this.cartService.findByUser(userId);
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Get('user/:userId/event/:eventId')
  findByUserAndEvent(@Param('userId') userId: string, @Param('eventId') eventId: string) {
    return this.cartService.findByUserAndEvent(userId, eventId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(id, updateCartDto);
  }

  @Post(':userId/:eventId/add')
  addItem(
    @Param('userId') userId: string,
    @Param('eventId') eventId: string,
    @Body() body: { vendorId: string; serviceId: string; serviceName: string; price: number }
  ) {
    return this.cartService.addItem(userId, eventId, body.vendorId, body.serviceId, body.serviceName, body.price);
  }

  @Delete(':id/item/:itemIndex')
  removeItem(@Param('id') id: string, @Param('itemIndex') itemIndex: number) {
    return this.cartService.removeItem(id, itemIndex);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }
}
