import { AuthenticatedUser } from '../types/auth.types';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userservice;
    constructor(userservice: UserService);
    create(req: any, createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    getMe(req: {
        user: AuthenticatedUser;
    }): Promise<import("./schemas/user.schema").UserDocument>;
    list(req: {
        user: AuthenticatedUser;
    }, limit?: string, offset?: string, userId?: string): Promise<import("./schemas/user.schema").UserDocument | import("./schemas/user.schema").UserDocument[]>;
    get(req: {
        user: AuthenticatedUser;
    }, id: string): Promise<import("./schemas/user.schema").UserDocument>;
    update(req: {
        user: AuthenticatedUser;
    }, id: string, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").UserDocument>;
    remove(req: {
        user: AuthenticatedUser;
    }, id: string): Promise<import("./schemas/user.schema").UserDocument>;
}
