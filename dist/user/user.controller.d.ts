import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userservice;
    constructor(userservice: UserService);
    create(createUserDto: CreateUserDto): Promise<any>;
    list(limit?: string, offset?: string, userId?: string): Promise<any>;
    get(id: string): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<any>;
}
