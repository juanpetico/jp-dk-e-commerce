import { Category } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.warn("API disconnect, loading empty categories", error);
        return [];
    }
};

export const createCategory = async (name: string): Promise<Category> => {
    const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });

    if (!res.ok) {
        throw new Error('Failed to create category');
    }

    const json = await res.json();
    return json.data;
};

export const updateCategory = async (id: string, name: string): Promise<Category> => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
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
    const res = await fetch(`${API_URL}/categories/${id}`, {
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
        const res = await fetch(`${API_URL}/categories/slug/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch category');
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.warn("API disconnect, loading mock category", error);
        return undefined;
    }
};
