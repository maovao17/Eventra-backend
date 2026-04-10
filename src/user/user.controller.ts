import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../types/auth.types';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { FirebaseBootstrapGuard } from '../auth/firebase-bootstrap.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userservice: UserService) {}

  @UseGuards(FirebaseBootstrapGuard)
  @Post()
  create(
    @Req() req: {
      user: {
        uid: string;
        email?: string;
        phoneNumber?: string;
      };
    },
    @Body() createUserDto: CreateUserDto,
  ) {
    const { email: _ignoredEmail, ...safeCreateUserDto } = createUserDto;

    return this.userservice.create({
      ...safeCreateUserDto,
      userId: req.user.uid,
      email: req.user.email || undefined,
    });
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getMe(@Req() req: { user: AuthenticatedUser }) {
    try {
      return await this.userservice.findByUserId(req.user.userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log('Auto-creating user for uid:', req.user.userId);
        const newUser = await this.userservice.create({
          userId: req.user.userId,
          name: req.user.name || 'New User',
          email: req.user.email || '',
          phoneNumber: req.user.phoneNumber || '',
          authProvider: req.user.phoneNumber ? 'phone' : 'google',
          role: 'customer',
        });
        return newUser;
      }
      throw error;
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async list(
    @Req() req: { user: AuthenticatedUser },
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
    @Query('userId') userId?: string,
  ) {
    if (userId) {
      if (req.user.userId === userId) {
        return this.userservice.findByUserId(userId);
      }

      if (req.user.role === 'admin') {
        return this.userservice.findByUserId(userId);
      }

      if (req.user.role === 'vendor') {
        return this.userservice.assertVendorCanAccessUser(
          req.user.userId,
          userId,
        );
      }

      throw new ForbiddenException('You do not have access to this user');
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }

    const l = Number(limit);
    const o = Number(offset);
    return this.userservice.findAll(isNaN(l) ? 20 : l, isNaN(o) ? 0 : o);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('customer', 'vendor', 'admin')
  @Get(':id')
  async get(@Req() req: { user: AuthenticatedUser }, @Param('id') id: string) {
    const user = await this.userservice.findById(id);

    if (req.user.role === 'admin') {
      return user;
    }

    if (String(user.userId) === String(req.user.userId)) {
      return user;
    }

    if (req.user.role === 'vendor') {
      return this.userservice.assertVendorCanAccessUser(
        req.user.userId,
        String(user.userId),
      );
    }

    throw new ForbiddenException('You do not have access to this user');
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: { user: AuthenticatedUser },
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const targetUser = await this.userservice.findById(id);
    if (
      req.user.role !== 'admin' &&
      String(targetUser.userId) !== String(req.user.userId)
    ) {
      throw new ForbiddenException('Users can only update their own profile');
    }
    return this.userservice.update(id, updateUserDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  async remove(@Req() req: { user: AuthenticatedUser }, @Param('id') id: string) {
    const targetUser = await this.userservice.findById(id);
    if (
      req.user.role !== 'admin' &&
      String(targetUser.userId) !== String(req.user.userId)
    ) {
      throw new ForbiddenException('Users can only delete their own profile');
    }
    return this.userservice.remove(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('approve-vendor/:userId')
  async approveVendor(@Param('userId') userId: string) {
    return this.userservice.approveVendor(userId);
  }
}
