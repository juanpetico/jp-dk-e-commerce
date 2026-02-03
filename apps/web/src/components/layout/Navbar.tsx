"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '../../store/CartContext';
import { useUser } from '../../store/UserContext';
import { Search, User, ShoppingBag, Menu, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const { cart, toggleCart } = useCart();
    const { user, isAuthenticated, logout } = useUser();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUserClick = () => {
        if (isAuthenticated) {
            setIsUserDropdownOpen(!isUserDropdownOpen);
        } else {
            router.push('/login');
        }
    };

    const handleLogout = () => {
        logout();
        toast.info('Sesión cerrada correctamente');
        setIsUserDropdownOpen(false);
        router.push('/');
    };

    const isProfileRoute = ['/profile', '/orders', '/settings'].some(route => pathname?.startsWith(route));

    if (isProfileRoute) return null;

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
                            <Link href="/" className="font-display text-4xl font-black tracking-tighter italic transform -skew-x-12 px-2 border-4 border-black dark:border-white">
                                JP DK
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-8 items-center justify-center flex-1">
                            <Link href="/" className="font-display text-base uppercase font-bold tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Inicio</Link>
                            <Link href="/catalog" className="font-display text-base uppercase font-bold tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Catálogo</Link>
                            <Link href="/catalog" className="font-display text-base uppercase font-bold tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Lookbook</Link>
                            <Link href="/catalog" className="font-display text-base uppercase font-bold tracking-wider text-red-600 hover:text-red-700 transition-colors">Sale</Link>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 p-2 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>

                            {/* User Dropdown */}
                            <div className="relative hidden sm:block group" ref={dropdownRef}>
                                <button
                                    onClick={handleUserClick}
                                    className="flex items-center gap-1 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 p-2 transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                {/* Dropdown cuando NO está autenticado - aparece en hover */}
                                {!isAuthenticated && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <Link
                                            href="/login"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Iniciar sesión
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Crear cuenta
                                        </Link>
                                    </div>
                                )}

                                {/* Dropdown cuando SÍ está autenticado - aparece en hover */}
                                {user && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Perfil</Link>
                                            <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Pedidos</Link>
                                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Configuración</Link>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

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
                            <Link href="/" className="block px-3 py-2 text-base font-bold font-display uppercase hover:bg-gray-50 dark:hover:bg-gray-800">Inicio</Link>
                            <Link href="/catalog" className="block px-3 py-2 text-base font-bold font-display uppercase hover:bg-gray-50 dark:hover:bg-gray-800">Catálogo</Link>
                            <Link href="/catalog" className="block px-3 py-2 text-base font-bold font-display uppercase hover:bg-gray-50 dark:hover:bg-gray-800">Lookbook</Link>
                            <Link href="/catalog" className="block px-3 py-2 text-base font-bold font-display uppercase text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800">Sale</Link>
                            {!isAuthenticated && (
                                <Link href="/login" className="block px-3 py-2 text-base font-bold font-display uppercase text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">Iniciar Sesión</Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
