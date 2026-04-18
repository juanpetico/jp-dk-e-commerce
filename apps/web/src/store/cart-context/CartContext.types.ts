import { ReactNode } from 'react';
import { CartItem, Coupon, Product } from '@/types';

export interface CartContextType {
    cart: CartItem[];
    isOpen: boolean;
    addToCart: (product: Product, size: string, quantity?: number) => Promise<boolean>;
    removeFromCart: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    toggleCart: () => void;
    cartTotal: number;
    buyNowItem: CartItem | null;
    setBuyNowItem: (item: CartItem | null) => void;
    appliedCoupon: Coupon | null;
    setAppliedCoupon: (coupon: Coupon | null) => void;
    clearCart: () => void;
}

export interface CartProviderProps {
    children: ReactNode;
}
