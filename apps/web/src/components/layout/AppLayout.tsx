'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { Toaster } from 'sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isProfileRoute = ['/profile', '/orders', '/settings', '/coupons'].some(route => pathname?.startsWith(route));
    const shouldShowNavbar = !isAdminRoute && !isProfileRoute;

    return (
        <>
            {shouldShowNavbar && <Navbar />}
            {!isAdminRoute && <CartDrawer />}
            <main className="min-h-screen">
                {children}
            </main>
            <Toaster richColors position="top-center" />
            {!isAdminRoute && <Footer />}
        </>
    );
}
