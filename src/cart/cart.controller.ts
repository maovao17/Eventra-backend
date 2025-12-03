import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  create(@Body() dto: CreateCartDto) {
    return this.cartService.create(dto);
  }

  @Get()
  list(@Query('limit') limit = '20', @Query('offset') offset = '0') {
    const l = Number(limit);
    const o = Number(offset);
    return this.cartService.findAll(isNaN(l) ? 20 : l, isNaN(o) ? 0 : o);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.cartService.findById(id);
  }

  @Get('user/:user_id')
  getByUserId(@Param('user_id') user_id: string) {
    return this.cartService.findByUserId(user_id);
  }

  @Get('session/:session_id')
  getBySessionId(@Param('session_id') session_id: string) {
    return this.cartService.findBySessionId(session_id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.cartService.update(id, dto);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() item: any) {
    return this.cartService.addItem(id, item);
  }

  @Delete(':id/items/:itemIndex')
  removeItem(@Param('id') id: string, @Param('itemIndex') itemIndex: string) {
    return this.cartService.removeItem(id, Number(itemIndex));
  }

  @Delete(':id/clear')
  clearCart(@Param('id') id: string) {
    return this.cartService.clearCart(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }
}
