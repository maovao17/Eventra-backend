import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userservice: UserService) {}

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userservice.create(createUserDto);
  }

  @Get()
  list(@Query('limit') limit = '20', @Query('offset') offset = '0') {
    const l = Number(limit);
    const o = Number(offset);
    return this.userservice.findAll(isNaN(l) ? 20 : l, isNaN(o) ? 0 : o);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.userservice.findById(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userservice.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userservice.remove(id);
  }
}
