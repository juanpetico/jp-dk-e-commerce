import { Category } from '../types';
import { apiFetch } from '@/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface CreateCategoryPayload {
    name: string;
    imageUrl?: string | null;
}

export const fetchCategories = async (options?: { isPublished?: boolean }): Promise<Category[]> => {
    try {
        const params = new URLSearchParams();
        if (typeof options?.isPublished === 'boolean') {
            params.set('isPublished', String(options.isPublished));
        }
        const query = params.toString();
        const url = query ? `${API_URL}/categories?${query}` : `${API_URL}/categories`;

        const res = await apiFetch(url);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.warn("API disconnect, loading empty categories", error);
        return [];
    }
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
    const res = await apiFetch(`${API_URL}/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Failed to create category');
    }

    const json = await res.json();
    return json.data;
};

export const updateCategory = async (id: string, name: string): Promise<Category> => {
    const res = await apiFetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });

    if (!res.ok) {
        throw new Error('Failed to update category');
    }

    const json = await res.json();
    return json.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    const res = await apiFetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Failed to delete category');
    }
};

export const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
    try {
        const res = await apiFetch(`${API_URL}/categories/slug/${slug}?isPublished=true`);
        if (!res.ok) throw new Error('Failed to fetch category');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.warn("API disconnect, loading mock category", error);
        return undefined;
    }
};

export const patchCategory = async (
    id: string,
    payload: Partial<Pick<Category, 'name' | 'isPublished' | 'sortOrder' | 'imageUrl'>>
): Promise<Category> => {
    const res = await apiFetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Failed to patch category');
    }

    const json = await res.json();
    return json.data;
};
