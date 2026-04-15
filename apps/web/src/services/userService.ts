import { User as Customer } from '../types';

const API_URL = 'http://localhost:5001/api';

export const fetchUsers = async (): Promise<Customer[]> => {
    try {
        const res = await fetch(`${API_URL}/users`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch users');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
    }
};
