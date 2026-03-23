import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    issueToken(userId?: string): Promise<{
        accessToken: string;
        userId: string;
        role: any;
    }>;
}
