'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/store/UserContext';
import ProfileLayoutNav from './ProfileLayout.nav';
import ProfileLayoutUserMenu from './ProfileLayout.user-menu';

interface ProfileLayoutClientProps {
    children: React.ReactNode;
}

export default function ProfileLayoutClient({ children }: ProfileLayoutClientProps) {
    const pathname = usePathname();
    const { logout } = useUser();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActivePath = (path: string) => pathname.startsWith(path);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-12">
                            <Link href="/" className="font-display font-bold text-2xl tracking-tighter italic">
                                JP DK
                            </Link>

                            <ProfileLayoutNav isActivePath={isActivePath} variant="desktop" />
                        </div>

                        <ProfileLayoutUserMenu
                            isMenuOpen={isMenuOpen}
                            onToggleMenu={() => setIsMenuOpen((current) => !current)}
                            onCloseMenu={() => setIsMenuOpen(false)}
                            onLogout={handleLogout}
                        />
                    </div>

                    <ProfileLayoutNav isActivePath={isActivePath} variant="mobile" />
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
