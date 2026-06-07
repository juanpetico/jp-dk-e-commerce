'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/store/UserContext';
import { User } from '@/types';

type Role = User['role'];

interface ProtectedRouteProps {
    children: React.ReactNode;
    // Roles permitidos. Si se omite, basta con estar autenticado.
    roles?: Role[];
    // Destino cuando el rol no alcanza (default: home).
    forbiddenRedirect?: string;
}

export default function ProtectedRoute({ children, roles, forbiddenRedirect = '/' }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
            router.push(loginUrl);
            return;
        }

        if (roles && (!user || !roles.includes(user.role))) {
            router.push(forbiddenRedirect);
            return;
        }

        setIsAuthorized(true);
    }, [user, isAuthenticated, roles, forbiddenRedirect, pathname, router]);

    if (!isAuthorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
