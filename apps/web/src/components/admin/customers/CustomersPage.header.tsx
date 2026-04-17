import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CustomersPageHeaderProps {
    loading: boolean;
    visibleCount: number;
}

export default function CustomersPageHeader({ loading, visibleCount }: CustomersPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Clientes
                    </h1>
                    {!loading && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {visibleCount} {visibleCount === 1 ? 'cliente' : 'clientes'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">Gestiona usuarios y roles</p>
            </div>

            <Button variant="outline" className="flex items-center gap-2" disabled>
                <Download className="h-4 w-4" />
                Exportar
            </Button>
        </div>
    );
}
