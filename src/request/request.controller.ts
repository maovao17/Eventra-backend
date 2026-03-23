import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestService.create(createRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('vendor')
  findForVendor(@Req() req) {
    return this.requestService.findByVendorUser(req.user.id);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('vendorId') vendorId?: string, @Query('eventId') eventId?: string) {
    if (userId) return this.requestService.findByUser(userId);
    if (vendorId) return this.requestService.findByVendor(vendorId);
    if (eventId) return this.requestService.findByEvent(eventId);
    return this.requestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestService.update(id, updateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestService.remove(id);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Body('actorUserId') actorUserId?: string) {
    return this.requestService.accept(id, actorUserId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('actorUserId') actorUserId?: string) {
    return this.requestService.reject(id, actorUserId);
  }
}
