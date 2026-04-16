import { User as Customer, AdminUser, AuditEntry, UserRole } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const withQuery = (path: string, params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
};

export const fetchUsers = async (params?: { role?: UserRole | 'ALL' }): Promise<Customer[]> => {
    try {
        const url = withQuery(`${API_URL}/users`, {
            role: params?.role,
        });
        const res = await fetch(url, { credentials: 'include' });
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

export const getUserById = async (id: string): Promise<Customer & Partial<AdminUser>> => {
    const res = await fetch(`${API_URL}/users/${id}`, { credentials: 'include' });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
        throw new Error(json.message || 'No se pudo obtener el usuario');
    }

    return json.data;
};

export const getAdminUsers = async (params: {
    search?: string;
    role?: UserRole | 'ALL';
    status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    cursor?: string;
    limit?: number;
}): Promise<{ users: AdminUser[]; nextCursor: string | null }> => {
    const url = withQuery(`${API_URL}/admin/users`, {
        search: params.search,
        role: params.role,
        status: params.status,
        cursor: params.cursor,
        limit: params.limit,
    });

    const res = await fetch(url, { credentials: 'include' });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
        throw new Error(json.message || 'No se pudo obtener la lista de usuarios');
    }

    return json.data as { users: AdminUser[]; nextCursor: string | null };
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<AdminUser> => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || 'No se pudo actualizar el rol');
    }

    return json.data.user as AdminUser;
};

export const toggleUserStatus = async (
    userId: string,
    isActive: boolean,
    deactivationReason?: string
): Promise<AdminUser> => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive, ...(deactivationReason ? { deactivationReason } : {}) }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || 'No se pudo actualizar el estado del usuario');
    }

    return json.data.user as AdminUser;
};

export const getUserAuditLog = async (
    userId: string,
    limit = 20,
    cursor?: string
): Promise<{ items: AuditEntry[]; nextCursor: string | null }> => {
    const url = withQuery(`${API_URL}/admin/audit/users/${userId}`, { limit, cursor });

    const res = await fetch(url, { credentials: 'include' });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.success) {
        throw new Error(json.message || 'No se pudo obtener la auditoría de usuario');
    }

    return json.data as { items: AuditEntry[]; nextCursor: string | null };
};
