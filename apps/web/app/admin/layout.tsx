import React from 'react';
import AdminSidebar from '../../src/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-background text-foreground min-h-screen select-none">
            <AdminSidebar />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
