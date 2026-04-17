import React from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AuditLoadingState() {
    return (
        <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando registros...</span>
        </div>
    );
}

export function AuditErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-6 text-center text-destructive">
            <ShieldAlert className="h-8 w-8" />
            <p>{error}</p>
            <Button variant="outline" onClick={onRetry}>Reintentar</Button>
        </div>
    );
}
