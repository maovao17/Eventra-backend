import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseBoolPipe,
  DefaultValuePipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  create(@Body() createDto: CreateTemplateDto) {
    return this.templatesService.create(createDto);
  }

  @Get()
  findAll(
    @Query('populate', new DefaultValuePipe('false'), ParseBoolPipe) populate: boolean,
  ) {
    return this.templatesService.findAll(populate);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('populate', new DefaultValuePipe('false'), ParseBoolPipe) populate: boolean,
  ) {
    return this.templatesService.findOne(id, populate);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateTemplateDto) {
    return this.templatesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.templatesService.remove(id);
  }
}
