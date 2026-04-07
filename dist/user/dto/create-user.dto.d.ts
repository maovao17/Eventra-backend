export declare class CreateUserDto {
    phoneNumber?: string;
    name: string;
    email?: string;
    profile_photo?: string;
    userId: string;
    authProvider: 'phone' | 'google';
    role: 'customer' | 'vendor';
    businessName?: string;
}
