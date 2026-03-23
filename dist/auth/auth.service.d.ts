import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly userService;
    constructor(jwtService: JwtService, userService: UserService);
    issueToken(userId: string): Promise<{
        accessToken: string;
        userId: string;
        role: any;
    }>;
}
