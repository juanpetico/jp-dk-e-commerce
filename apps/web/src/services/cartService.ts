import { CartItem, Product } from '../types';
import { apiFetch } from '@/lib/apiClient';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/cart`;

const JSON_HEADERS: HeadersInit = { 'Content-Type': 'application/json' };

export const cartService = {
    async getCart(): Promise<CartItem[]> {
        const res = await apiFetch(API_URL, {
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch cart');
        const json = await res.json();

        if (!json.data || !json.data.items) return [];

        return json.data.items.map((item: any) => ({
            ...item.product,
            id: item.product.id,
            cartItemId: item.id,
            selectedSize: item.size,
            quantity: item.quantity,
        }));
    },

    async addItem(productId: string, size: string, quantity: number): Promise<CartItem> {
        const res = await apiFetch(API_URL, {
            method: 'POST',
            credentials: 'include',
            headers: JSON_HEADERS,
            body: JSON.stringify({ productId, size, quantity }),
        });
        if (!res.ok) throw new Error('Failed to add item');
        const json = await res.json();
        const item = json.data;

        return {
            ...item.product,
            id: item.product.id,
            cartItemId: item.id,
            selectedSize: item.size,
            quantity: item.quantity,
        };
    },

    async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
        const res = await apiFetch(`${API_URL}/item/${itemId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: JSON_HEADERS,
            body: JSON.stringify({ quantity }),
        });
        if (!res.ok) throw new Error('Failed to update quantity');
        const json = await res.json();
        const item = json.data;

        return {
            ...item.product,
            id: item.product.id,
            selectedSize: item.size,
            quantity: item.quantity,
        };
    },

    async removeItem(itemId: string): Promise<void> {
        const res = await apiFetch(`${API_URL}/item/${itemId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to remove item');
    },

    async clearCart(): Promise<void> {
        const res = await apiFetch(API_URL, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to clear cart');
    }
};
