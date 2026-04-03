import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { Vendor } from '../vendor/schemas/vendor.schema';
import { Booking } from '../booking/schemas/booking.schema';
import { Request } from '../request/schemas/request.schema';

describe('UserService', () => {
  let service: UserService;
  const modelMock = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: modelMock,
        },
        {
          provide: getModelToken(Vendor.name),
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
