import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Post()
  create(@Req() req, @Body() dto: CreateEventDto) {
    return this.eventService.create({
      ...dto,
      customerId: req.user.role === 'admin' ? dto.customerId : req.user.uid,
    });
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Get()
  findAll(
    @Req() req,
    @Query('userId') userId?: string,
    @Query('customerId') customerId?: string,
  ) {
    if (req.user.role === 'admin') {
      const effectiveCustomerId = customerId ?? userId;
      if (effectiveCustomerId)
        return this.eventService.findByUser(effectiveCustomerId);
      return this.eventService.findAll();
    }

    return this.eventService.findByUser(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const event = await this.eventService.findById(id);

    if (
      req.user.role !== 'admin' &&
      String(event.customerId) !== String(req.user.uid)
    ) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return event;
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventService.findById(id);
    if (
      req.user.role !== 'admin' &&
      event.customerId &&
      String(event.customerId) !== String(req.user.uid)
    ) {
      throw new ForbiddenException(
        'Customers can only update their own events',
      );
    }
    return this.eventService.update(id, dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const event = await this.eventService.findById(id);
    if (
      req.user.role !== 'admin' &&
      event.customerId &&
      String(event.customerId) !== String(req.user.uid)
    ) {
      throw new ForbiddenException(
        'Customers can only delete their own events',
      );
    }
    return this.eventService.remove(id);
  }
}
