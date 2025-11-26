import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomiseEventService } from './customise-event.service';
import { CreateCustomiseEventDto } from './dto/create-customise-event.dto';
import { UpdateCustomiseEventDto } from './dto/update-customise-event.dto';

@Controller('customise-event')
export class CustomiseEventController {
  constructor(private readonly customiseEventService: CustomiseEventService) {}

  @Post()
  create(@Body() createDto: CreateCustomiseEventDto) {
    return this.customiseEventService.create(createDto);
  }

  @Get()
  findAll() {
    return this.customiseEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customiseEventService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCustomiseEventDto) {
    return this.customiseEventService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customiseEventService.remove(id);
  }
}
