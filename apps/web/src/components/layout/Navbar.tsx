"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../store/CartContext';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
    const { cart, toggleCart } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className="bg-black text-white text-[10px] md:text-xs py-2 overflow-hidden border-b border-gray-800">
                <div className="flex whitespace-nowrap animate-marquee">
                    <div className="flex items-center">
                        <span className="mx-4">ENVÍO GRATIS POR COMPRAS SOBRE $50.000</span>•
                        <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>•
                        <span className="mx-4">ENVÍO GRATIS POR COMPRAS SOBRE $50.000</span>•
                        <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>•
                        <span className="mx-4">ENVÍO GRATIS POR COMPRAS SOBRE $50.000</span>
                    </div>
                    <div className="flex items-center">
                        <span className="mx-4">ENVÍO GRATIS POR COMPRAS SOBRE $50.000</span>•
                        <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>•
                        <span className="mx-4">ENVÍO GRATIS POR COMPRAS SOBRE $50.000</span>•
                        <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>•
                        <span className="mx-4">ENVÍO GRATIS POR COMPRAS SOBRE $50.000</span>
                    </div>
                </div>
            </div>

            <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 text-black dark:text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 p-2"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center justify-center flex-1 md:flex-none md:justify-start">
                            <Link href="/" className="font-display text-4xl font-black tracking-tighter italic transform -skew-x-12 px-2 border-4 border-black">
                                JP DK
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-8 items-center justify-center flex-1">
                            <Link href="/" className="font-display text-base uppercase font-bold tracking-wider hover:text-gray-600 transition-colors">Inicio</Link>
                            <Link href="/catalog" className="font-display text-base uppercase font-bold tracking-wider hover:text-gray-600 transition-colors">Catálogo</Link>
                            <Link href="/catalog" className="font-display text-base uppercase font-bold tracking-wider hover:text-gray-600 transition-colors">Lookbook</Link>
                            <Link href="/catalog" className="font-display text-base uppercase font-bold tracking-wider text-red-600 hover:text-red-700 transition-colors">Sale</Link>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 p-2 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 p-2 transition-colors hidden sm:block">
                                <User className="w-5 h-5" />
                            </button>
                            <button
                                onClick={toggleCart}
                                className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 p-2 transition-colors relative"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-fade-in">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-in">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link href="/" className="block px-3 py-2 text-base font-bold font-display uppercase hover:bg-gray-50">Inicio</Link>
                            <Link href="/catalog" className="block px-3 py-2 text-base font-bold font-display uppercase hover:bg-gray-50">Catálogo</Link>
                            <Link href="/catalog" className="block px-3 py-2 text-base font-bold font-display uppercase hover:bg-gray-50">Lookbook</Link>
                            <Link href="/catalog" className="block px-3 py-2 text-base font-bold font-display uppercase text-red-600 hover:bg-gray-50">Sale</Link>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
