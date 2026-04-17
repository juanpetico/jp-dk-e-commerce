import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UsersPageHeaderProps {
    loading: boolean;
    usersCount: number;
}

export default function UsersPageHeader({ loading, usersCount }: UsersPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Gestión de Usuarios
                    </h1>
                    {!loading && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {usersCount} {usersCount === 1 ? 'usuario' : 'usuarios'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Administra roles, estados de cuenta y trazabilidad de cambios.
                </p>
            </div>

            <Button variant="outline" className="flex items-center gap-2" disabled>
                <Download className="h-4 w-4" />
                Exportar
            </Button>
        </div>
    );
}
