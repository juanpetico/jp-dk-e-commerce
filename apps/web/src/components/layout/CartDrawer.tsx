"use client";

import React from 'react';
import { useCart } from '../../store/CartContext';
import { Button } from '../ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

import { X, Trash2, Plus, Minus, ShoppingBag, Lock, Gift } from 'lucide-react';

const CartDrawer: React.FC = () => {
    const { isOpen, toggleCart, cart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const FREE_SHIPPING_THRESHOLD = 50000;
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const progressPercentage = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            // Also ensure any pointer events are re-enabled if they were disabled (rare but safe)
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-slide-in text-foreground border-l border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                    <div className="flex items-center gap-3">
                        <h2 className="font-display text-xl uppercase tracking-tight font-bold">Carrito</h2>
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {cart.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    </div>
                    <button onClick={toggleCart} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="px-6 py-4 bg-muted/30 border-b border-border">
                    <p className="text-sm font-medium mb-2 text-center text-muted-foreground">
                        {remainingForFreeShipping > 0
                            ? <span>¡Te faltan <strong className="text-foreground">{formatPrice(remainingForFreeShipping)}</strong> para envío gratis!</span>
                            : <span className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-2"><Gift className="w-4 h-4" /> ¡Tienes envío gratis!</span>
                        }
                    </p>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-black dark:bg-white h-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Cart Items */}
                <ScrollArea className="flex-1 bg-background">
                    <div className="p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
                                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium mb-1">Tu carrito está vacío</p>
                                <p className="text-sm">¡Agrega algunos productos para comenzar!</p>
                                <Button variant="outline" className="mt-6 border-foreground/20 hover:bg-accent" onClick={toggleCart}>
                                    Ver productos
                                </Button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                                    <div className="w-24 h-32 flex-shrink-0 bg-muted overflow-hidden relative rounded-md border border-border">
                                        <img src={item.images[0]?.url || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-sm uppercase leading-tight pr-4 line-clamp-2">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium">Talla: {item.selectedSize}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border border-input rounded-md overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                                    className="px-2 py-1 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center bg-background">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                                    className="px-2 py-1 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-border bg-card">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="text-foreground font-medium">{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Envío</span>
                                <span className="text-xs italic">Calculado en el siguiente paso</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-border mt-2 text-foreground">
                                <span className="uppercase">Total</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                        </div>
                        <Button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base">
                            <Lock className="w-4 h-4" />
                            Finalizar Compra
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
