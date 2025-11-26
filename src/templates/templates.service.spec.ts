import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TemplatesService } from './templates.service';
import { Template } from './schemas/templates.schema';

describe('TemplatesService', () => {
  let service: TemplatesService;
  const mockTemplate = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Sample Template',
    description: 'desc',
    category: 'wedding',
    servicesIncluded: [],
    image: 'img.jpg',
    estimatedBudget: 1000,
  };

  const mockModel = {
    create: jest.fn().mockResolvedValue(mockTemplate),
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockTemplate]) }),
    findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTemplate) }),
    findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTemplate) }),
    findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTemplate) }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: getModelToken(Template.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should call model.create and return created document', async () => {
    const dto = { name: 'Sample Template' } as any;
    const res = await service.create(dto);
    expect(mockModel.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sample Template' }));
    expect(res).toEqual(mockTemplate);
  });

  it('findAll should return array', async () => {
    const res = await service.findAll();
    expect(mockModel.find).toHaveBeenCalled();
    expect(res).toEqual([mockTemplate]);
  });

  it('findOne with valid id should return document', async () => {
    const res = await service.findOne('507f1f77bcf86cd799439011');
    expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(res).toEqual(mockTemplate);
  });

  it('update should call findByIdAndUpdate and return updated', async () => {
    const res = await service.update('507f1f77bcf86cd799439011', { name: 'new' } as any);
    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', expect.any(Object), { new: true, runValidators: true });
    expect(res).toEqual(mockTemplate);
  });

  it('remove should call findByIdAndDelete', async () => {
    await service.remove('507f1f77bcf86cd799439011');
    expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});
