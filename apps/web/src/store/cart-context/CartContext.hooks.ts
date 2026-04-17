import { Dispatch, SetStateAction, useEffect } from 'react';
import { toast } from 'sonner';
import { CartItem, Product } from '@/types';
import { cartService } from '@/services/cartService';
import { calculateCartTotal, findCartItem, getVariantStock, mergeLocalCartItem } from './CartContext.utils';

interface CartActionDependencies {
    cart: CartItem[];
    setCart: Dispatch<SetStateAction<CartItem[]>>;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    isAuthenticated: boolean;
}

export const useServerCartSync = (
    isAuthenticated: boolean,
    userId: string | undefined,
    setCart: Dispatch<SetStateAction<CartItem[]>>,
) => {
    useEffect(() => {
        const loadCart = async () => {
            if (!isAuthenticated || !userId) {
                return;
            }

            try {
                const serverCart = await cartService.getCart();
                setCart(serverCart);
            } catch (error) {
                console.error('Failed to load cart from server', error);
            }
        };

        loadCart();
    }, [isAuthenticated, userId, setCart]);
};

export const useCartTotal = (cart: CartItem[]) => {
    return calculateCartTotal(cart);
};

export const createCartActions = ({ cart, setCart, setIsOpen, isAuthenticated }: CartActionDependencies) => {
    const addToCart = async (product: Product, size: string, quantity: number = 1): Promise<boolean> => {
        const availableStock = getVariantStock(product, size);
        if (availableStock === 0) {
            toast.error('Producto sin stock');
            return false;
        }

        const wasEmpty = cart.length === 0;

        if (isAuthenticated) {
            try {
                const existingItem = findCartItem(cart, product.id, size);
                const currentQty = existingItem ? existingItem.quantity : 0;

                if (currentQty + quantity > availableStock) {
                    toast.error(`Solo quedan ${availableStock} disponibles, revisa tu tienda!`);
                    return false;
                }

                const newItem = await cartService.addItem(product.id, size, quantity);

                setCart((prev) => {
                    const existingIdx = prev.findIndex((item) => item.id === product.id && item.selectedSize === size);
                    if (existingIdx >= 0) {
                        const nextCart = [...prev];
                        nextCart[existingIdx] = newItem;
                        return nextCart;
                    }

                    return [...prev, newItem];
                });

                if (wasEmpty) {
                    setIsOpen(true);
                }

                return true;
            } catch (error) {
                console.error('Failed to add item to server cart', error);
                return false;
            }
        }

        let success = true;
        setCart((prev) => {
            const existingItem = findCartItem(prev, product.id, size);

            if (existingItem && existingItem.quantity + quantity > availableStock) {
                toast.error(`Solo quedan ${availableStock} disponibles, revisa tu tienda!`);
                success = false;
                return prev;
            }

            if (quantity > availableStock) {
                toast.error(`Solo quedan ${availableStock} disponibles, revisa tu tienda!`);
                success = false;
                return prev;
            }

            return mergeLocalCartItem(prev, product, size, quantity);
        });

        if (success && wasEmpty) {
            setIsOpen(true);
        }

        return success;
    };

    const removeFromCart = async (productId: string, size: string) => {
        if (isAuthenticated) {
            try {
                const itemToRemove = findCartItem(cart, productId, size);
                if (itemToRemove?.cartItemId) {
                    await cartService.removeItem(itemToRemove.cartItemId);
                }
            } catch (error) {
                console.error('Failed to remove item from server cart', error);
            }
        }

        setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedSize === size)));
    };

    const updateQuantity = async (productId: string, size: string, quantity: number) => {
        if (quantity < 1) {
            await removeFromCart(productId, size);
            return;
        }

        const currentItem = findCartItem(cart, productId, size);
        if (currentItem) {
            const availableStock = getVariantStock(currentItem, size);
            if (quantity > availableStock) {
                toast.error(`Solo quedan ${availableStock} unidades disponibles`);
                return;
            }
        }

        if (isAuthenticated) {
            try {
                const itemToUpdate = findCartItem(cart, productId, size);
                if (itemToUpdate?.cartItemId) {
                    const updatedItem = await cartService.updateQuantity(itemToUpdate.cartItemId, quantity);
                    setCart((prev) =>
                        prev.map((item) => (item.id === productId && item.selectedSize === size ? updatedItem : item)),
                    );
                    return;
                }
            } catch (error) {
                console.error('Failed to update quantity on server', error);
            }
        }

        setCart((prev) =>
            prev.map((item) => (item.id === productId && item.selectedSize === size ? { ...item, quantity } : item)),
        );
    };

    return { addToCart, removeFromCart, updateQuantity };
};
