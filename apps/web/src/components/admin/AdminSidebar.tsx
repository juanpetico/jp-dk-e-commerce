"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, ChevronLeft, Menu, Users, Tags } from 'lucide-react';
import { useUser } from '../../store/UserContext';
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

    return (
        <aside
            ref={sidebarRef}
            className="bg-background text-foreground flex-shrink-0 hidden md:flex flex-col border-r border-border relative transition-all duration-75 ease-linear group/sidebar text-left h-screen sticky top-0"
            style={{ width: isCollapsed ? 80 : sidebarWidth }}
        >
            {/* Resizer Handle */}
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
                <NavItem
                    icon={<LayoutDashboard className="w-5 h-5" />}
                    label="Dashboard"
                    href={`${basePath}/dashboard`}
                    isActive={pathname === `${basePath}/dashboard` || pathname === basePath}
                    isCollapsed={isCollapsed}
                />

                {isSuperAdmin && (
                    <>
                        <NavItem
                            icon={<Users className="w-5 h-5" />}
                            label="Usuarios"
                            href="/superadmin/users"
                            isActive={pathname?.startsWith('/superadmin/users') || false}
                            isCollapsed={isCollapsed}
                        />
                        <NavItem
                            icon={<Settings className="w-5 h-5" />}
                            label="Auditoría"
                            href="/superadmin/audit"
                            isActive={pathname?.startsWith('/superadmin/audit') || false}
                            isCollapsed={isCollapsed}
                        />
                    </>
                )}

                <NavItem
                    icon={<Package className="w-5 h-5" />}
                    label="Productos"
                    href={`${basePath}/products`}
                    isActive={pathname?.startsWith(`${basePath}/products`) || false}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    icon={<ShoppingBag className="w-5 h-5" />}
                    label="Pedidos"
                    href={`${basePath}/orders`}
                    isActive={pathname?.startsWith(`${basePath}/orders`) || false}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    icon={<Users className="w-5 h-5" />}
                    label="Clientes"
                    href={`${basePath}/customers`}
                    isActive={pathname?.startsWith(`${basePath}/customers`) || false}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    icon={<Tags className="w-5 h-5" />}
                    label="Marketing"
                    href={`${basePath}/marketing`}
                    isActive={pathname?.startsWith(`${basePath}/marketing`) || false}
                    isCollapsed={isCollapsed}
                />
                <NavItem
                    icon={<Settings className="w-5 h-5" />}
                    label="Configuración"
                    href={`${basePath}/settings`}
                    isActive={pathname === `${basePath}/settings`}
                    isCollapsed={isCollapsed}
                />

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
            </nav>
        </aside>
    );
}
