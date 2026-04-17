import { createContext, useContext, useState } from 'react';
import { CartItem, Coupon } from '@/types';
import { useUser } from './UserContext';
import { createCartActions, useCartTotal, useServerCartSync } from './cart-context/CartContext.hooks';
import { useBuyNowItemPersistence, useCouponPersistence } from './cart-context/CartContext.storage';
import { CART_KEY } from './cart-context/CartContext.utils';
import { CartContextType, CartProviderProps } from './cart-context/CartContext.types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: CartProviderProps) => {
    const { user, isAuthenticated } = useUser();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    useCouponPersistence(appliedCoupon, setAppliedCoupon);
    useBuyNowItemPersistence(buyNowItem, setBuyNowItem);
    useServerCartSync(isAuthenticated, user?.id, setCart);

    const cartTotal = useCartTotal(cart);

    const { addToCart, removeFromCart, updateQuantity } = createCartActions({
        cart,
        setCart,
        setIsOpen,
        isAuthenticated,
    });

    const toggleCart = () => setIsOpen((prev) => !prev);

    const clearCart = () => {
        setCart([]);
        setAppliedCoupon(null);
        setBuyNowItem(null);
        localStorage.removeItem(CART_KEY);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                toggleCart,
                cartTotal,
                buyNowItem,
                setBuyNowItem,
                appliedCoupon,
                setAppliedCoupon,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
