import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
    cart: CartItem[];
    isOpen: boolean;
    addToCart: (product: Product, size: string) => void;
    removeFromCart: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    toggleCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);

    useEffect(() => {
        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setCartTotal(total);
    }, [cart]);

    const addToCart = (product: Product, size: string) => {
        setCart((prev) => {
            const existingItem = prev.find(
                (item) => item.id === product.id && item.selectedSize === size
            );

            if (existingItem) {
                return prev.map((item) =>
                    item.id === product.id && item.selectedSize === size
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { ...product, selectedSize: size, quantity: 1 }];
        });
        setIsOpen(true);
    };

    const removeFromCart = (productId: string, size: string) => {
        setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedSize === size)));
    };

    const updateQuantity = (productId: string, size: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId, size);
            return;
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

    return (
        <CartContext.Provider
            value={{ cart, isOpen, addToCart, removeFromCart, updateQuantity, toggleCart, cartTotal }}
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
