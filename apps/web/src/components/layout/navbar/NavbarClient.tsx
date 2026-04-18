"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useShopConfigPublic } from '@/hooks/useShopConfigPublic';
import SearchOverlay from '../SearchOverlay';
import { fetchCategories } from '@/services/categoryService';
import { useCart } from '@/store/CartContext';
import { useUser } from '@/store/UserContext';
import NavbarMobileMenu from './Navbar.mobile-menu';
import NavbarUserDropdown from './Navbar.user-dropdown';
import { NavbarMenuChild } from './Navbar.types';
import {
    buildMenuItems,
    FALLBACK_CATEGORIES,
    getCartCount,
    getShippingMessage,
    PROFILE_HIDDEN_ROUTES,
    sortMenuItems,
} from './Navbar.utils';

export default function NavbarClient() {
    const pathname = usePathname();
    const router = useRouter();
    const { cart, toggleCart } = useCart();
    const { user, isAuthenticated, logout } = useUser();
    const { freeShippingThreshold } = useShopConfigPublic();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categories, setCategories] = useState<NavbarMenuChild[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isProfileRoute = PROFILE_HIDDEN_ROUTES.some((route) => pathname?.startsWith(route));
    const shippingMessage = getShippingMessage(freeShippingThreshold);
    const cartCount = getCartCount(cart.map((item) => item.quantity));

    const sortedMenuItems = useMemo(() => {
        return sortMenuItems(buildMenuItems(categories));
    }, [categories]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories({ isPublished: true });

                if (data.length > 0) {
                    setCategories(
                        data.map((category) => ({
                            label: category.name,
                            path: `/category/${category.slug}`,
                        })),
                    );
                    return;
                }

                setCategories(FALLBACK_CATEGORIES);
            } catch {
                setCategories(FALLBACK_CATEGORIES);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            setIsSearchOpen(false);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleLogout = async () => {
        await logout();
        setIsUserDropdownOpen(false);
        router.push('/');
        toast.info('Sesion cerrada correctly');
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsCategoryOpen(false);
    };

    if (isProfileRoute) {
        return null;
    }

    return (
        <div className={cn('z-40 w-full transition-colors duration-300', isMenuOpen ? 'fixed top-0 left-0' : 'sticky top-0')}>
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
                        <div className="flex items-center z-40">
                            <button
                                onClick={() => {
                                    setIsMenuOpen((current) => !current);
                                    setIsUserDropdownOpen(false);
                                }}
                                className="text-foreground hover:text-muted-foreground p-2 -ml-2 transition-colors focus:outline-none"
                            >
                                {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                            </button>
                        </div>

                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 text-center">
                            <Link
                                href="/"
                                onClick={closeMenu}
                                className="font-display text-4xl font-black tracking-tighter italic px-2 border-2 border-foreground inline-block hover:scale-105 transition-transform duration-300"
                            >
                                JP DK
                            </Link>
                        </div>

                        <div className="flex items-center space-x-1 md:space-x-3 z-40">
                            <button
                                onClick={() => setIsSearchOpen((current) => !current)}
                                className="p-2 transition-colors text-foreground hover:text-muted-foreground"
                            >
                                <Search className="w-6 h-6" />
                            </button>

                            <NavbarUserDropdown
                                dropdownRef={dropdownRef}
                                isOpen={isUserDropdownOpen}
                                isAuthenticated={isAuthenticated}
                                user={user}
                                onToggle={() => setIsUserDropdownOpen((current) => !current)}
                                onClose={() => setIsUserDropdownOpen(false)}
                                onLogout={handleLogout}
                            />

                            <button
                                onClick={toggleCart}
                                className="text-foreground hover:text-muted-foreground p-2 transition-colors relative"
                            >
                                <motion.div
                                    key={cartCount}
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                >
                                    <ShoppingBag className="w-6 h-6" />
                                </motion.div>
                                {cartCount > 0 && (
                                    <motion.span
                                        key={`badge-${cartCount}`}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: [1, 1.4, 1], opacity: 1 }}
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

                <NavbarMobileMenu
                    isOpen={isMenuOpen}
                    isCategoryOpen={isCategoryOpen}
                    menuItems={sortedMenuItems}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    onClose={closeMenu}
                    onToggleCategory={() => setIsCategoryOpen((current) => !current)}
                />
            </nav>
        </div>
    );
}
