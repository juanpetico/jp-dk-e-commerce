"use client";

import React from 'react';
import { useCart } from '../../store/CartContext';
import { Button } from '@repo/ui';
import Link from 'next/link';

const CartDrawer: React.FC = () => {
    const { isOpen, toggleCart, cart, removeFromCart, updateQuantity, cartTotal } = useCart();
    const FREE_SHIPPING_THRESHOLD = 50000;
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const progressPercentage = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in text-black">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <h2 className="font-display text-xl uppercase tracking-tight">Carrito</h2>
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">
                            {cart.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    </div>
                    <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        {/* Using a simple X if material-icons not configured, can replace later */}
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Free Shipping Progress */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium mb-2 text-center text-gray-700">
                        {remainingForFreeShipping > 0
                            ? <span>¡Te faltan <strong>{formatPrice(remainingForFreeShipping)}</strong> para envío gratis!</span>
                            : <span className="text-green-600 font-bold">¡Tienes envío gratis! 🔥</span>
                        }
                    </p>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-black h-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <span className="text-4xl mb-2">🛍️</span>
                            <p>Tu carrito está vacío</p>
                            <Button variant="outline" className="mt-4" onClick={toggleCart}>
                                Ver productos
                            </Button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                                <div className="w-24 h-32 flex-shrink-0 bg-gray-100 overflow-hidden relative">
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-sm uppercase leading-tight pr-4">{item.name}</h3>
                                            <button
                                                onClick={() => removeFromCart(item.id, item.selectedSize)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <span className="text-lg">🗑️</span>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Talla: {item.selectedSize}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center border border-gray-300">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600 text-sm"
                                            >-</button>
                                            <span className="px-2 py-1 text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600 text-sm"
                                            >+</button>
                                        </div>
                                        <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-white">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Envío</span>
                                <span className="text-xs text-gray-400">Calculado en el siguiente paso</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-dashed border-gray-200 mt-2">
                                <span className="uppercase">Total</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                        </div>
                        <Button fullWidth className="flex items-center justify-center gap-2">
                            <span className="text-sm">🔒</span>
                            Finalizar Compra
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
