import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AuthenticatedUser } from '../types/auth.types';
import { VendorService } from './vendor.service';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) { }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@Req() req: { user: AuthenticatedUser }) {
    return this.vendorService.findByUserId(req.user.userId);
  }

  @UseGuards(FirebaseAuthGuard)
  @UseGuards(FirebaseAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: { user: AuthenticatedUser }, @Body() body: UpdateVendorDto) {
    console.log("Saving vendor profile - UID:", req.user.userId, "Data:", body);
    return this.vendorService.updateProfile(req.user.userId, body);
  }

  @Get()
  @Get('all')
  findAll() {
    return this.vendorService.getAllVendors();
  }

  @Get()
  findApproved() {
    return this.vendorService.findAllCompleted();
  }

  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any, @Req() req: { user: AuthenticatedUser }) {
    return {
      fullUrl: `https://your-storage-url.com/uploads/${file.filename}`,
      filename: file.filename
    };
  }

  @Patch('approve/:id')
  approve(@Param('id') id: string) {
    return this.vendorService.approveVendor(id);
  }
}
