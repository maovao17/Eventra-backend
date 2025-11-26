import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Get()
  list(@Query('limit') limit = '20', @Query('offset') offset = '0') {
    const l = Number(limit);
    const o = Number(offset);
    return this.serviceService.findAll(isNaN(l) ? 20 : l, isNaN(o) ? 0 : o);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.serviceService.findById(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.serviceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
