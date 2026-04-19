import { Address, User } from '@/types';
import { apiFetch } from '@/lib/apiClient';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const fetchAuthSession = () => {
    return apiFetch(`${API_URL}/auth/session`);
};

export const fetchLogin = (email: string, password: string) => {
    return apiFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
};

export const fetchRegister = (email: string, password: string, name: string, phone?: string) => {
    return apiFetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name, phone: phone?.trim() || undefined }),
    });
};

export const fetchCheckEmailAvailability = (email: string) => {
    return apiFetch(`${API_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
    });
};

export const fetchLogout = () => {
    return apiFetch(`${API_URL}/auth/logout`, {
        method: 'POST',
    });
};

export const fetchUpdateProfile = (data: Partial<User>) => {
    return apiFetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

export const fetchAddAddress = (address: Omit<Address, 'id'>) => {
    return apiFetch(`${API_URL}/users/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
    });
};

export const fetchUpdateAddress = (id: string, address: Partial<Address>) => {
    return apiFetch(`${API_URL}/users/address/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
    });
};

export const fetchDeleteAddress = (id: string) => {
    return apiFetch(`${API_URL}/users/address/${id}`, {
        method: 'DELETE',
    });
};
