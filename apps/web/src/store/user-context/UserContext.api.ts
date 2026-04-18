import { Address, User } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const fetchAuthSession = () => {
    return fetch(`${API_URL}/auth/session`, {
        credentials: 'include',
    });
};

export const fetchLogin = (email: string, password: string) => {
    return fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
};

export const fetchRegister = (email: string, password: string, name: string, phone?: string) => {
    return fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name, phone: phone?.trim() || undefined }),
    });
};

export const fetchCheckEmailAvailability = (email: string) => {
    return fetch(`${API_URL}/auth/check-email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
    });
};

export const fetchLogout = () => {
    return fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
};

export const fetchUpdateProfile = (data: Partial<User>) => {
    return fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

export const fetchAddAddress = (address: Omit<Address, 'id'>) => {
    return fetch(`${API_URL}/users/address`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
    });
};

export const fetchUpdateAddress = (id: string, address: Partial<Address>) => {
    return fetch(`${API_URL}/users/address/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
    });
};

export const fetchDeleteAddress = (id: string) => {
    return fetch(`${API_URL}/users/address/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
};
