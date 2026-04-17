"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '../../store/CartContext';
import { useUser } from '../../store/UserContext';
import { Search, User, ShoppingBag, Menu, X, ChevronDown, MonitorCog, Package, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import SearchOverlay from './SearchOverlay';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useShopConfigPublic } from '@/hooks/useShopConfigPublic';

interface MenuItem {
    id: string;
    type: 'link' | 'accordion';
    label: string;
    path?: string;
    isRed?: boolean;
    children?: { label: string; path: string }[];
}

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const { cart, toggleCart } = useCart();
    const { user, isAuthenticated, logout } = useUser();
    const router = useRouter();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const { freeShippingThreshold } = useShopConfigPublic();
    const shippingEnabled = freeShippingThreshold > 0;
    const shippingMessage = shippingEnabled
        ? `ENVÍO GRATIS POR COMPRAS SOBRE $${freeShippingThreshold.toLocaleString('es-CL')}`
        : 'DESPACHO A TODO CHILE';

    const isProfileRoute = ['/profile', '/orders', '/settings', '/admin', '/superadmin', '/checkout'].some(route => pathname?.startsWith(route));

    // 0. State for categories
    const [categories, setCategories] = useState<{ label: string, path: string }[]>([]);

    useEffect(() => {
        import('../../services/categoryService').then(({ fetchCategories }) => {
            fetchCategories({ isPublished: true }).then(data => {
                if (data && data.length > 0) {
                    const mapped = data.map(cat => ({
                        label: cat.name,
                        path: `/category/${cat.slug}`
                    }));
                    setCategories(mapped);
                } else {
                    // Fallback to defaults if fetch fails or returns empty
                    setCategories([
                        { label: 'Poleras', path: '/category/poleras' },
                        { label: 'Polerones', path: '/category/polerones' },
                        { label: 'Lentes', path: '/category/lentes' }
                    ]);
                }
            });
        });
    }, []);

    // 1. Define the dynamic menu items (excluding 'Inicio' which is fixed)
    const dynamicMenuItems: MenuItem[] = [
        {
            id: 'catalog',
            type: 'link',
            label: 'Catálogo',
            path: '/catalog'
        },
        {
            id: 'category',
            type: 'accordion',
            label: 'Categoría',
            children: categories
        },
        {
            id: 'sale',
            type: 'link',
            label: 'Sale',
            path: '/catalog?sale=true',
            isRed: true
        },
    ];

    // 2. Automatically sort items by label length to create a "Tree" shape (Pyramid)
    const sortedMenuItems = useMemo(() => {
        return [...dynamicMenuItems].sort((a, b) => a.label.length - b.label.length);
    }, [categories]);

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

    // Prevent scroll when menu is open on mobile
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            // Also close search if menu opens
            setIsSearchOpen(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    const handleUserClick = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
        router.push('/');
        toast.info('Sesión cerrada correctly');
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsUserDropdownOpen(false);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsCategoryOpen(false);
    };

    if (isProfileRoute) return null;

    return (
        <div className={cn(
            "z-40 w-full transition-colors duration-300",
            isMenuOpen ? "fixed top-0 left-0" : "sticky top-0"
        )}>
            {/* Marquee */}
            <div className="bg-white text-black dark:bg-black dark:text-white text-[10px] md:text-xs py-2 overflow-hidden border-b border-border relative z-50 transition-colors duration-300">
                <div className="whitespace-nowrap animate-marquee inline-block">
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>•
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>•
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>•
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 text-fuchsia-500 font-bold">🔥 NUEVO DROP DISPONIBLE 🔥</span>
                </div>
            </div>

            <nav className="bg-background text-foreground border-b border-border transition-colors duration-300 relative">
                <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 relative">

                        {/* Left: Hamburger Menu (Always visible) */}
                        <div className="flex items-center z-40">
                            <button
                                onClick={toggleMenu}
                                className="text-foreground hover:text-muted-foreground p-2 -ml-2 transition-colors focus:outline-none"
                            >
                                {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                            </button>
                        </div>

                        {/* Center: Logo (Absolutely positioned) */}
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 text-center">
                            <Link href="/" onClick={closeMenu} className="font-display text-4xl font-black tracking-tighter italic px-2 border-2 border-foreground inline-block hover:scale-105 transition-transform duration-300">
                                JP DK
                            </Link>
                        </div>

                        {/* Right: Icons */}
                        <div className="flex items-center space-x-1 md:space-x-3 z-40">

                            <button
                                onClick={toggleSearch}
                                className="p-2 transition-colors text-foreground hover:text-muted-foreground"
                            >
                                <Search className="w-6 h-6" />
                            </button>

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={handleUserClick}
                                    className="flex items-center gap-1 text-foreground hover:text-muted-foreground p-2 transition-colors"
                                >
                                    <User className="w-6 h-6" />
                                </button>

                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border py-2 z-[60] animate-fade-in">
                                        {isAuthenticated && user ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="py-1">
                                                    {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                                                        <Link
                                                            href={user.role === 'SUPERADMIN' ? '/superadmin/dashboard' : '/admin/dashboard'}
                                                            onClick={() => setIsUserDropdownOpen(false)}
                                                            className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                                        >
                                                            <MonitorCog className="w-4 h-4 text-muted-foreground" />
                                                            Panel
                                                        </Link>
                                                    )}
                                                    <Link href="/profile" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        Perfil
                                                    </Link>

                                                    <Link href="/orders" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors">
                                                        <Package className="w-4 h-4 text-muted-foreground" />
                                                        Pedidos
                                                    </Link>

                                                    <Link
                                                        href={user.role === 'SUPERADMIN' ? "/superadmin/settings" : "/profile"}
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                                        Configuración
                                                    </Link>
                                                </div>
                                                <div className="border-t border-border pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted/50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Cerrar sesión
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-1">
                                                <Link href="/login" onClick={() => setIsUserDropdownOpen(false)} className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 font-bold flex items-center gap-3 transition-colors">
                                                    <LogIn className="w-4 h-4 text-muted-foreground" />
                                                    Iniciar sesión
                                                </Link>
                                                <Link href="/login" onClick={() => setIsUserDropdownOpen(false)} className=" px-4 py-2 text-sm text-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors">
                                                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                                                    Crear cuenta
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={toggleCart}
                                className="text-foreground hover:text-muted-foreground p-2 transition-colors relative"
                            >
                                <motion.div
                                    key={cartCount}
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <ShoppingBag className="w-6 h-6" />
                                </motion.div>
                                {cartCount > 0 && (
                                    <motion.span
                                        key={`badge-${cartCount}`}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{
                                            scale: [1, 1.4, 1],
                                            opacity: 1
                                        }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-foreground z-10"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Full Screen Navigation Menu */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full h-[calc(100vh-100%)] bg-background border-t border-border animate-slide-in z-20 flex flex-col shadow-2xl">
                        <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col items-center justify-center space-y-6">

                            {/* 1. Fixed 'Inicio' */}
                            <Link href="/" onClick={closeMenu} className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground hover:text-muted-foreground hover:scale-105 transition-all">
                                Inicio
                            </Link>

                            {/* 2. Sorted Items */}
                            {sortedMenuItems.map((item) => (
                                <React.Fragment key={item.id}>
                                    {item.type === 'link' ? (
                                        <Link
                                            href={item.path || '#'}
                                            onClick={closeMenu}
                                            className={`text-3xl md:text-5xl font-display font-black uppercase tracking-tight hover:scale-105 transition-all ${item.isRed ? 'text-red-600 hover:text-red-500' : 'text-foreground hover:text-muted-foreground'}`}
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        /* Accordion Item */
                                        <div className="flex flex-col items-center w-full">
                                            <button
                                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                                className="flex items-center justify-center gap-2 text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground hover:text-muted-foreground hover:scale-105 transition-all focus:outline-none"
                                            >
                                                {item.label}
                                                <ChevronDown className={`w-8 h-8 md:w-12 md:h-12 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Submenu */}
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col items-center space-y-4 ${isCategoryOpen ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                {item.children?.map((child) => (
                                                    <Link
                                                        key={child.label}
                                                        href={child.path}
                                                        onClick={closeMenu}
                                                        className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}

                            <div className="w-24 h-px bg-border my-4"></div>

                            {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                                <Link href={(user?.role === 'ADMIN' ? '/admin' : '/superadmin')} onClick={closeMenu} className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                    Admin Panel
                                </Link>
                            )}
                            {!isAuthenticated && (
                                <Link href="/login" onClick={closeMenu} className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;

