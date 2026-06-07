import React from 'react';
import AdminSidebar from '../../src/components/admin/shared/AdminSidebar';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}>
            <div className="flex bg-background text-foreground min-h-screen select-none">
                <AdminSidebar />
                <main className="flex-1 pt-24 px-4 pb-6 md:p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
