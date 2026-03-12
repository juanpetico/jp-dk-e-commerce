import { Category } from '../types';

const API_URL = 'http://localhost:5001/api';

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
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
    });

    if (!res.ok) {
        throw new Error('Failed to create category');
    }

    const json = await res.json();
    return json.data;
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
