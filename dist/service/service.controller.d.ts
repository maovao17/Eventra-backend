import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    create(dto: CreateServiceDto): Promise<any>;
    list(limit?: string, offset?: string): Promise<any[]>;
    get(id: string): Promise<any>;
    update(id: string, dto: UpdateServiceDto): Promise<any>;
    remove(id: string): Promise<any>;
}
