import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserService } from '../user/user.service';

describe('VendorController', () => {
  let controller: VendorController;
  const vendorServiceMock = {
    create: jest.fn(),
    findPublic: jest.fn(),
    findByServices: jest.fn(),
    getByUserId: jest.fn(),
    updateByUserId: jest.fn(),
    getDashboard: jest.fn(),
    addPortfolioItems: jest.fn(),
    assignServices: jest.fn(),
    updateAvailability: jest.fn(),
    getVendorBookings: jest.fn(),
    updateVendorBookingStatus: jest.fn(),
    getVendorReviews: jest.fn(),
  };
  const userServiceMock = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorController],
      providers: [
        {
          provide: VendorService,
          useValue: vendorServiceMock,
        },
        {
          provide: FirebaseAuthGuard,
          useClass: FirebaseAuthGuard,
        },
        {
          provide: RolesGuard,
          useClass: RolesGuard,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VendorController>(VendorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
