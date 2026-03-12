import { CartItem, Product } from '../types';

const API_URL = 'http://localhost:5001/api/cart';

interface BackendCartItem {
    id: string;
    quantity: number;
    size: string;
    product: Product & { images: { id: string; url: string; productId: string }[] };
}

export const cartService = {
    async getCart(token: string): Promise<CartItem[]> {
        const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch cart');
        const json = await res.json();

        if (!json.data || !json.data.items) return [];

        return json.data.items.map((item: any) => ({
            ...item.product,
            id: item.product.id,
            cartItemId: item.id, // Store backend ID
            selectedSize: item.size,
            quantity: item.quantity,
            // Backend product might have specific fields, frontend Product interface needs matching.
            // Ensure images are mapped if needed.
        }));
    },

    async addItem(token: string, productId: string, size: string, quantity: number): Promise<CartItem> {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, size, quantity }),
        });
        if (!res.ok) throw new Error('Failed to add item');
        const json = await res.json();
        const item = json.data;

        // Return formatted CartItem
        return {
            ...item.product,
            id: item.product.id,
            cartItemId: item.id,
            selectedSize: item.size,
            quantity: item.quantity,
        };
    },

    async updateQuantity(token: string, itemId: string, quantity: number): Promise<CartItem> {
        // Note: The backend uses CartItem ID for updates.
        // But frontend usually knows Product ID and Size.
        // We might need to store CartItem ID in frontend CartItem or lookup.
        // For simplicity, let's assume we pass the CartItem ID if we have it, 
        // OR we change backend to accept productId + size?
        // Backend `updateQuantity` takes `itemId` (CartItem ID).
        // Frontend `CartItem` does NOT currently have `cartItemId`.
        // We should add `cartItemId` to frontend CartItem or change backend to allow update by product+size.
        // Changing backend is cleaner for the current frontend structure?
        // OR we just map it.

        // Let's assume we will pass cartItemId. 
        // We need to modify CartContext to store cartItemId?

        const res = await fetch(`${API_URL}/item/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
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

    async removeItem(token: string, itemId: string): Promise<void> {
        const res = await fetch(`${API_URL}/item/${itemId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to remove item');
    },

    async clearCart(token: string): Promise<void> {
        const res = await fetch(API_URL, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to clear cart');
    }
};
