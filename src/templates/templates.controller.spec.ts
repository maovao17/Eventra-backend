import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

describe('TemplatesController', () => {
  let controller: TemplatesController;

  const mockTemplate = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Sample Template',
  };

  const templatesServiceMock = {
    create: jest.fn().mockResolvedValue(mockTemplate),
    findAll: jest.fn().mockResolvedValue([mockTemplate]),
    findOne: jest.fn().mockResolvedValue(mockTemplate),
    update: jest.fn().mockResolvedValue(mockTemplate),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [{ provide: TemplatesService, useValue: templatesServiceMock }],
    }).compile();

    controller = module.get<TemplatesController>(TemplatesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create', async () => {
    const dto = { name: 'Sample Template' } as any;
    const res = await controller.create(dto);
    expect(templatesServiceMock.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual(mockTemplate);
  });

  it('findAll should call service.findAll', async () => {
    const res = await controller.findAll(false);
    expect(templatesServiceMock.findAll).toHaveBeenCalledWith(false);
    expect(res).toEqual([mockTemplate]);
  });

  it('findOne should call service.findOne', async () => {
    const res = await controller.findOne('507f1f77bcf86cd799439011', false);
    expect(templatesServiceMock.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011', false);
    expect(res).toEqual(mockTemplate);
  });

  it('update should call service.update', async () => {
    const res = await controller.update('507f1f77bcf86cd799439011', { name: 'x' } as any);
    expect(templatesServiceMock.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { name: 'x' });
    expect(res).toEqual(mockTemplate);
  });

  it('remove should call service.remove', async () => {
    const res = await controller.remove('507f1f77bcf86cd799439011');
    expect(templatesServiceMock.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(res).toBeUndefined();
  });
});
