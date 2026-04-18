'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../src/components/admin/shared/AdminSidebar';
import { useUser } from '../../src/store/UserContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated } = useUser();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user?.role !== 'SUPERADMIN') {
            router.push('/admin/dashboard'); // Redirect to normal admin if not superadmin
            return;
        }

        setIsAuthorized(true);
    }, [user, isAuthenticated, router]);

    if (!isAuthorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex bg-background text-foreground min-h-screen select-none">
            <AdminSidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
