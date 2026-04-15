import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { CartItem, Product, Coupon } from '../types';

interface CartContextType {
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

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useUser } from './UserContext';
import { cartService } from '../services/cartService';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useUser();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    // Persist coupon
    useEffect(() => {
        const savedCoupon = localStorage.getItem('appliedCoupon');
        if (savedCoupon) {
            try {
                setAppliedCoupon(JSON.parse(savedCoupon));
            } catch (e) {
                console.error("Failed to parse appliedCoupon", e);
            }
        }
    }, []);

    useEffect(() => {
        if (appliedCoupon) {
            localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
        } else {
            localStorage.removeItem('appliedCoupon');
        }
    }, [appliedCoupon]);

    // Persist buyNowItem
    useEffect(() => {
        const savedItem = localStorage.getItem('buyNowItem');
        if (savedItem) {
            try {
                setBuyNowItem(JSON.parse(savedItem));
            } catch (e) {
                console.error("Failed to parse buyNowItem", e);
            }
        }
    }, []);

    useEffect(() => {
        if (buyNowItem) {
            localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
        } else {
            localStorage.removeItem('buyNowItem');
        }
    }, [buyNowItem]);

    // Fetch cart from backend when user logs in
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated && user) {
                try {
                    const serverCart = await cartService.getCart();
                    setCart(serverCart);
                } catch (error) {
                    console.error("Failed to load cart from server", error);
                }
            }
        };
        loadCart();
    }, [isAuthenticated, user]);

    useEffect(() => {
        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setCartTotal(total);
    }, [cart]);

    const addToCart = async (product: Product, size: string, quantity: number = 1): Promise<boolean> => {
        const variant = product.variants?.find(v => v.size === size);
        const availableStock = variant?.stock || 0;

        if (availableStock === 0) {
            toast.error("Producto sin stock");
            return false;
        }

        const wasEmpty = cart.length === 0;

        // If user is logged in, sync with backend
        if (isAuthenticated) {
            try {
                const existingItem = cart.find(item => item.id === product.id && item.selectedSize === size);
                const currentQty = existingItem ? existingItem.quantity : 0;

                if (currentQty + quantity > availableStock) {
                    toast.error(`Solo quedan ${availableStock} disponibles, revisa tu tienda!`);
                    return false;
                }

                const newItem = await cartService.addItem(product.id, size, quantity);

                setCart((prev) => {
                    const existingIdx = prev.findIndex(item => item.id === product.id && item.selectedSize === size);
                    if (existingIdx >= 0) {
                        const newCart = [...prev];
                        newCart[existingIdx] = newItem;
                        return newCart;
                    }
                    return [...prev, newItem];
                });

                if (wasEmpty) setIsOpen(true);
                return true;
            } catch (error) {
                console.error("Failed to add item to server cart", error);
                return false;
            }
        }

        // Local cart logic (fallback or guest)
        let success = true;
        setCart((prev) => {
            const existingItem = prev.find(
                (item) => item.id === product.id && item.selectedSize === size
            );

            if (existingItem) {
                if (existingItem.quantity + quantity > availableStock) {
                    toast.error(`Solo quedan ${availableStock} disponibles, revisa tu tienda!`);
                    success = false;
                    return prev;
                }
                return prev.map((item) =>
                    item.id === product.id && item.selectedSize === size
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            if (quantity > availableStock) {
                toast.error(`Solo quedan ${availableStock} disponibles, revisa tu tienda!`);
                success = false;
                return prev;
            }

            return [...prev, { ...product, selectedSize: size, quantity }];
        });

        if (success && wasEmpty) setIsOpen(true);
        return success;
    };

    const removeFromCart = async (productId: string, size: string) => {
        if (isAuthenticated) {
            try {
                const itemToRemove = cart.find(item => item.id === productId && item.selectedSize === size);
                if (itemToRemove && itemToRemove.cartItemId) {
                    await cartService.removeItem(itemToRemove.cartItemId);
                }
            } catch (error) {
                console.error("Failed to remove item from server cart", error);
            }
        }

        setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedSize === size)));
    };

    const updateQuantity = async (productId: string, size: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId, size);
            return;
        }

        const currentItem = cart.find(item => item.id === productId && item.selectedSize === size);
        if (currentItem) {
            const variant = currentItem.variants?.find(v => v.size === size);
            const availableStock = variant?.stock || 0;

            if (quantity > availableStock) {
                toast.error(`Solo quedan ${availableStock} unidades disponibles`);
                return;
            }
        }


        if (isAuthenticated) {
            try {
                const itemToUpdate = cart.find(item => item.id === productId && item.selectedSize === size);
                if (itemToUpdate && itemToUpdate.cartItemId) {
                    const updatedItem = await cartService.updateQuantity(itemToUpdate.cartItemId, quantity);

                    setCart((prev) =>
                        prev.map((item) =>
                            item.id === productId && item.selectedSize === size
                                ? updatedItem
                                : item
                        )
                    );
                    return;
                }
            } catch (error) {
                console.error("Failed to update quantity on server", error);
            }
        }

        setCart((prev) =>
            prev.map((item) =>
                item.id === productId && item.selectedSize === size
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const toggleCart = () => setIsOpen((prev) => !prev);

    const clearCart = () => {
        setCart([]);
        setAppliedCoupon(null);
        setBuyNowItem(null);
        localStorage.removeItem('cart');
        localStorage.removeItem('appliedCoupon');
        localStorage.removeItem('buyNowItem');
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
