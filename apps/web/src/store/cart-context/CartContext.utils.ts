import { CartItem, Product } from '@/types';

export const APPLIED_COUPON_KEY = 'appliedCoupon';
export const BUY_NOW_ITEM_KEY = 'buyNowItem';
export const CART_KEY = 'cart';

export const getVariantStock = (product: Product | CartItem, size: string) => {
    const variant = product.variants?.find((item) => item.size === size);
    return variant?.stock || 0;
};

export const findCartItem = (cart: CartItem[], productId: string, size: string) => {
    return cart.find((item) => item.id === productId && item.selectedSize === size);
};

export const calculateCartTotal = (cart: CartItem[]) => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

export const mergeLocalCartItem = (cart: CartItem[], product: Product, size: string, quantity: number) => {
    const existingItem = findCartItem(cart, product.id, size);

    if (!existingItem) {
        return [...cart, { ...product, selectedSize: size, quantity }];
    }

    return cart.map((item) =>
        item.id === product.id && item.selectedSize === size ? { ...item, quantity: item.quantity + quantity } : item,
    );
};
