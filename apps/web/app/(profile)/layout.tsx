'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useUser } from '../../src/store/UserContext';
import { useRouter } from 'next/navigation';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout } = useUser();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Custom Profile Navbar */}
            <nav className="border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-12">
                            <Link href="/" className="font-display font-bold text-2xl tracking-tighter italic">
                                JP DK
                            </Link>

                            {/* Nav Links */}
                            <div className="hidden md:flex items-center gap-8">
                                <Link
                                    href="/orders"
                                    className={`text-sm font-medium transition-colors ${isActive('/orders')
                                        ? 'text-foreground font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Pedidos
                                </Link>
                                <Link
                                    href="/profile"
                                    className={`text-sm font-medium transition-colors ${isActive('/profile')
                                        ? 'text-foreground font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Perfil
                                </Link>
                                <Link
                                    href="/settings"
                                    className={`text-sm font-medium transition-colors ${isActive('/settings')
                                        ? 'text-foreground font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Configuración
                                </Link>
                            </div>
                        </div>

                        {/* User Actions */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full border border-input flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-20 py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-amber-900)] hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main>
                {children}
            </main>
        </div>
    );
}
