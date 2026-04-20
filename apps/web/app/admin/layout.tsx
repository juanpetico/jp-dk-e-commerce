import React from 'react';
import AdminSidebar from '../../src/components/admin/shared/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-background text-foreground min-h-screen select-none">
            <AdminSidebar />
            <main className="flex-1 pt-24 px-4 pb-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
