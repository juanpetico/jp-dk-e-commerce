'use client';

import React from 'react';
import { useDashboard } from '@/hooks/admin/dashboard/useDashboard';
import { AdminDashboardView } from '@/components/admin/dashboard/AdminDashboardView';
import { usePathname } from 'next/navigation';

const AdminDashboardPage: React.FC = () => {
    const dashboard = useDashboard();
    const pathname = usePathname();
    const basePath: '/admin' | '/superadmin' = pathname.startsWith('/superadmin') ? '/superadmin' : '/admin';

    return <AdminDashboardView dashboard={dashboard} basePath={basePath} />;
};

export default AdminDashboardPage;
