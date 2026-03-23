import { Model } from 'mongoose';
import { ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServiceService {
    private serviceModel;
    constructor(serviceModel: Model<ServiceDocument>);
    private sanitize;
    create(dto: CreateServiceDto): Promise<any>;
    findAll(limit?: number, offset?: number): Promise<any[]>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdateServiceDto): Promise<any>;
    remove(id: string): Promise<any>;
}
