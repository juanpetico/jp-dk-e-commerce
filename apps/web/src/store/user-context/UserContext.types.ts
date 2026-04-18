import { Address, User } from '@/types';
import { ReactNode } from 'react';

export type LoginResult =
    | { success: true; role: string }
    | { success: false; reason: 'invalid_credentials' | 'account_disabled' | 'unknown' };

export interface RegisterResult {
    success: boolean;
    welcomeCoupon?: any;
}

export interface UserContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<LoginResult>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<RegisterResult>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
    updateAddress: (id: string, address: Partial<Address>) => Promise<boolean>;
    deleteAddress: (id: string) => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

export interface UserProviderProps {
    children: ReactNode;
}
