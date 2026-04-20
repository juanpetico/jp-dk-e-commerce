"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, ChevronLeft, Menu, Users, UserCog, Tags, ShieldCheck, FolderOpen, X, type LucideIcon } from 'lucide-react';
import { useUser } from '@/store/UserContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    href?: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick?: () => void;
    variant?: 'default' | 'danger';
}

type AdminNavMatchMode = 'dashboard' | 'exact' | 'prefix';

interface AdminNavItemConfig {
    icon: LucideIcon;
    label: string;
    slug: string;
    match: AdminNavMatchMode;
    superAdminOnly?: boolean;
}

const ADMIN_NAV_ITEMS: AdminNavItemConfig[] = [
    { icon: LayoutDashboard, label: 'Dashboard', slug: 'dashboard', match: 'dashboard' },
    { icon: UserCog, label: 'Usuarios', slug: 'users', match: 'prefix', superAdminOnly: true },
    { icon: ShieldCheck, label: 'Auditoría', slug: 'audit', match: 'prefix', superAdminOnly: true },
    { icon: Package, label: 'Productos', slug: 'products', match: 'prefix' },
    { icon: FolderOpen, label: 'Categorías', slug: 'categories', match: 'prefix' },
    { icon: ShoppingBag, label: 'Pedidos', slug: 'orders', match: 'prefix' },
    { icon: Users, label: 'Clientes', slug: 'customers', match: 'prefix' },
    { icon: Tags, label: 'Marketing', slug: 'marketing', match: 'prefix' },
    { icon: Settings, label: 'Configuración', slug: 'settings', match: 'exact' },
];

function isAdminNavItemActive(
    pathname: string | null,
    basePath: string,
    item: AdminNavItemConfig,
): boolean {
    const href = `${basePath}/${item.slug}`;
    if (item.match === 'dashboard') {
        return pathname === href || pathname === basePath;
    }
    if (item.match === 'exact') {
        return pathname === href;
    }
    return pathname?.startsWith(href) ?? false;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, isActive, onClick, variant = 'default', isCollapsed = false }) => {
    const baseClasses = "flex items-center gap-4 px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap overflow-hidden";
    const activeClasses = "bg-primary text-primary-foreground shadow-lg shadow-primary/5";
    const inactiveClasses = "text-muted-foreground hover:bg-accent hover:text-accent-foreground";
    const dangerClasses = "text-red-500 hover:bg-red-500/10 hover:text-red-400";

    const content = (
        <>
            <span className="flex-shrink-0">{icon}</span>
            {!isCollapsed && <span>{label}</span>}
        </>
    );

    const className = `${baseClasses} ${variant === 'danger'
        ? dangerClasses
        : isActive
            ? activeClasses
            : inactiveClasses
        } ${isCollapsed ? 'justify-center px-2' : ''}`;

    if (href) {
        return (
            <Link href={href} className={className} title={isCollapsed ? label : ''}>
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            title={isCollapsed ? label : ''}
            className={className}
        >
            {content}
        </button>
    );
};

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useUser();
    const router = useRouter();

    // Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(288);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Persistence: Load state
    useEffect(() => {
        const savedWidth = localStorage.getItem('sidebarWidth');
        const savedCollapsed = localStorage.getItem('isSidebarCollapsed');

        if (savedWidth) setSidebarWidth(parseInt(savedWidth));
        if (savedCollapsed) setIsCollapsed(savedCollapsed === 'true');

        setIsLoaded(true);
    }, []);

    // Persistence: Save state
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('sidebarWidth', sidebarWidth.toString());
            localStorage.setItem('isSidebarCollapsed', isCollapsed.toString());
        }
    }, [sidebarWidth, isCollapsed, isLoaded]);

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast.success('Sesión cerrada correctamente');
    };

    // Resizing Logic
    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = mouseEvent.clientX;
            if (newWidth < 200) {
                setIsCollapsed(true);
                setSidebarWidth(80);
            } else {
                setIsCollapsed(false);
                setSidebarWidth(Math.max(240, Math.min(newWidth, 480)));
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isMobileOpen) {
            return;
        }

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileOpen]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        if (isCollapsed) {
            setSidebarWidth(288);
        } else {
            setSidebarWidth(80);
        }
    };

    // Determine base path based on role or current path
    const isSuperAdmin = user?.role === 'SUPERADMIN';
    const basePath = isSuperAdmin ? '/superadmin' : '/admin';

    const navContent = (
        <>
            {ADMIN_NAV_ITEMS.map((item) => {
                if (item.superAdminOnly && !isSuperAdmin) {
                    return null;
                }
                const Icon = item.icon;
                return (
                    <NavItem
                        key={item.slug}
                        icon={<Icon className="w-5 h-5" />}
                        label={item.label}
                        href={`${basePath}/${item.slug}`}
                        isActive={isAdminNavItemActive(pathname, basePath, item)}
                        isCollapsed={isCollapsed}
                    />
                );
            })}

            <div className="pt-8 mt-auto">
                <NavItem
                    icon={<LogOut className="w-5 h-5" />}
                    label="Cerrar Sesión"
                    isActive={false}
                    isCollapsed={isCollapsed}
                    onClick={handleLogout}
                    variant="danger"
                />
            </div>
        </>
    );

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border px-4 h-16 flex items-center justify-between">
                <button
                    onClick={() => setIsMobileOpen((current) => !current)}
                    className="p-2 rounded-lg hover:bg-accent"
                    aria-label="Abrir menú de administración"
                >
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <span className="text-sm font-bold uppercase tracking-wider">Panel Admin</span>
                <div className="w-9" />
            </div>

            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileOpen(false)}>
                    <aside
                        className="bg-background text-foreground w-[85%] max-w-[320px] h-full border-r border-border p-4 flex flex-col"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="pb-4 border-b border-border flex items-center justify-between">
                            <Link href="/" className="relative h-16 w-32 block hover:opacity-80 transition-opacity">
                                <Image
                                    src="/logo.png"
                                    alt="JP DK ADMIN"
                                    fill
                                    sizes="128px"
                                    className="object-contain dark:invert"
                                    priority
                                />
                            </Link>
                            <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-lg hover:bg-accent" aria-label="Cerrar menú">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 pt-4 space-y-2 overflow-y-auto overflow-x-hidden">
                            {navContent}
                        </nav>
                    </aside>
                </div>
            )}

            <aside
                ref={sidebarRef}
                className="bg-background text-foreground flex-shrink-0 hidden md:flex flex-col border-r border-border relative transition-all duration-75 ease-linear group/sidebar text-left h-screen sticky top-0"
                style={{ width: isCollapsed ? 80 : sidebarWidth }}
            >
                <div
                    className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors z-50 opacity-0 hover:opacity-100 active:opacity-100 active:bg-primary/30"
                    onMouseDown={startResizing}
                />

                <div className={`p-6 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <Link href="/" className="relative h-24 w-60 block hover:opacity-80 transition-opacity">
                            <Image
                                src="/logo.png"
                                alt="JP DK ADMIN"
                                fill
                                sizes="(max-width: 768px) 100vw, 240px"
                                className="object-contain dark:invert"
                                priority
                            />
                        </Link>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navContent}
                </nav>
            </aside>
        </>
    );
}
