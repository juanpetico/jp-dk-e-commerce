import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuditPageHeaderProps {
    total: number;
    loading: boolean;
    onExport: () => void;
}

export default function AuditPageHeader({ total, loading, onExport }: AuditPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Auditoria
                    </h1>
                    {total > 0 && (
                        <span className="text-sm font-bold text-muted-foreground">
                            {total} {total === 1 ? 'registro' : 'registros'}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Registro de todas las acciones de alto impacto en el sistema.
                </p>
            </div>

            <Button variant="outline" className="flex items-center gap-2" onClick={onExport} disabled={loading || total === 0}>
                <Download className="h-4 w-4" />
                Exportar
            </Button>
        </div>
    );
}
