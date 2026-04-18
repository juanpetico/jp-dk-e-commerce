'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Settings,
    Users,
    UserCog,
    Tags,
    ShieldCheck,
    FolderOpen,
    Search,
    Eye,
    DollarSign,
} from 'lucide-react';

const ICON_BY_ROUTE: Record<string, React.ComponentType<{ className?: string }>> = {
    '/admin/products': Package,
    '/admin/categories': FolderOpen,
    '/admin/orders': ShoppingBag,
    '/admin/customers': Users,
    '/admin/marketing': Tags,
    '/admin/settings': Settings,
    '/superadmin/products': Package,
    '/superadmin/categories': FolderOpen,
    '/superadmin/orders': ShoppingBag,
    '/superadmin/customers': Users,
    '/superadmin/marketing': Tags,
    '/superadmin/settings': Settings,
    '/superadmin/users': UserCog,
    '/superadmin/audit': ShieldCheck,
};

interface TableEmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export default function TableEmptyState({
    title,
    description,
    actionLabel,
    onAction,
    className,
}: TableEmptyStateProps) {
    const pathname = usePathname();
    const Icon = ICON_BY_ROUTE[pathname] ?? Search;

    return (
        <div className={`flex min-h-[300px] flex-col items-center justify-center gap-4 ${className ?? ''}`.trim()}>
            <div className="rounded-full bg-muted p-4">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>

            <div className="text-center">
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {actionLabel && onAction && (
                <Button onClick={onAction} variant="outline" className="gap-2">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}