import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { VendorService } from './vendor.service';
import { Vendor } from './schemas/vendor.schema';
import { Service } from '../service/schemas/service.schema';
import { Booking } from '../booking/schemas/booking.schema';
import { Request } from '../request/schemas/request.schema';
import { Review } from '../review/schemas/review.schema';
import { Notification } from '../notification/schemas/notification.schema';
import { UserService } from '../user/user.service';

describe('VendorService', () => {
  let service: VendorService;
  const modelMock = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn(),
  };
  const userServiceMock = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        {
          provide: getModelToken(Vendor.name),
          useValue: modelMock,
        },
        {
          provide: getModelToken(Service.name),
          useValue: modelMock,
        },
        {
          provide: getModelToken(Booking.name),
          useValue: modelMock,
        },
        {
          provide: getModelToken(Request.name),
          useValue: modelMock,
        },
        {
          provide: getModelToken(Review.name),
          useValue: modelMock,
        },
        {
          provide: getModelToken(Notification.name),
          useValue: modelMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
