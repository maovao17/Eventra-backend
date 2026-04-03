export interface AuthenticatedUser {
  uid: string;
  id: string;
  email: string;
  phoneNumber: string;
  role: 'customer' | 'vendor' | 'admin';
  userId: string;
  name: string;
  businessName?: string;
}