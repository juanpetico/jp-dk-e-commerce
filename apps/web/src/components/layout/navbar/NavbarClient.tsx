"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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
    const [isNavTransparent, setIsNavTransparent] = useState(false);
    const [categories, setCategories] = useState<NavbarMenuChild[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLDivElement>(null);

    const isProfileRoute = PROFILE_HIDDEN_ROUTES.some((route) => pathname?.startsWith(route));
    const isHomeRoute = pathname === '/';
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

    useEffect(() => {
        const navbarNode = navbarRef.current;
        if (!navbarNode) return;

        if (isMenuOpen) {
            navbarNode.classList.add('navbar-menu-active');
        } else {
            navbarNode.classList.remove('navbar-menu-active');
        }
    }, [isMenuOpen]);

    useEffect(() => {
        const navbarNode = navbarRef.current;
        if (!navbarNode) return;

        if (isSearchOpen) {
            navbarNode.classList.add('navbar-search-active');
        } else {
            navbarNode.classList.remove('navbar-search-active');
        }

        if (isSearchOpen && isNavTransparent) {
            navbarNode.classList.add('dark');
        } else {
            navbarNode.classList.remove('dark');
        }
    }, [isSearchOpen, isNavTransparent]);

    useEffect(() => {
        const navbarNode = navbarRef.current;

        if (!navbarNode) {
            return;
        }

        const handleNavbarScroll = () => {
            const transparent = isHomeRoute && window.scrollY <= 50;
            setIsNavTransparent(transparent);

            if (!transparent) {
                navbarNode.classList.add('navbar-opaco');
            } else {
                navbarNode.classList.remove('navbar-opaco');
            }
        };

        handleNavbarScroll();
        window.addEventListener('scroll', handleNavbarScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleNavbarScroll);
            navbarNode.classList.remove('navbar-opaco');
        };
    }, [isHomeRoute]);

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
        <div ref={navbarRef} className="site-header-wrapper w-full z-40 fixed top-0 left-0">
            <div className="announcement-bar text-[10px] md:text-xs py-2 overflow-hidden relative z-40">
                <div className="whitespace-nowrap animate-marquee inline-block">
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 font-bold">NUEVO DROP DISPONIBLE</span>•
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 font-bold">NUEVO DROP DISPONIBLE</span>•
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 font-bold">NUEVO DROP DISPONIBLE</span>•
                    <span className="mx-4">{shippingMessage}</span>•
                    <span className="mx-4 font-bold">NUEVO DROP DISPONIBLE</span>
                    <span className="mx-4 font-bold">NUEVO DROP DISPONIBLE</span>
                    <span className="mx-4 font-bold">NUEVO DROP DISPONIBLE</span>
                </div>
            </div>

            <nav className="site-header relative">
                <SearchOverlay
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                    variant="dropdown"
                    isNavTransparent={isNavTransparent}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="site-header-mainbar flex justify-between items-center h-20 relative">
                        <div className="flex items-center z-40">
                            <button
                                onClick={() => {
                                    setIsMenuOpen((current) => !current);
                                    setIsUserDropdownOpen(false);
                                }}
                                className="nav-icon-button p-2 -ml-2 transition-colors focus:outline-none"
                            >
                                {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                            </button>
                        </div>

                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center pointer-events-none px-14 sm:px-0">
                            <Link
                                href="/"
                                onClick={closeMenu}
                                className="nav-logo-link font-display text-2xl sm:text-4xl font-black tracking-tighter italic px-2 border-2 inline-block hover:scale-105 transition-transform duration-300 max-w-[170px] sm:max-w-none truncate pointer-events-auto"
                            >
                                JP DK
                            </Link>
                        </div>

                        <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-3 z-40">
                            <button
                                onClick={() => setIsSearchOpen((current) => !current)}
                                className="nav-icon-button p-1.5 sm:p-2 transition-colors"
                            >
                                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
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
                                className="nav-icon-button p-1.5 sm:p-2 transition-colors relative"
                            >
                                <motion.div
                                    key={cartCount}
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                >
                                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                                </motion.div>
                                {cartCount > 0 && (
                                    <motion.span
                                        key={`badge-${cartCount}`}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: [1, 1.4, 1], opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                        className="nav-cart-badge absolute top-0 right-0 text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border z-10"
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
