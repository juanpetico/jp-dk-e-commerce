import React from 'react';
import { Loader2 } from 'lucide-react';
import AdminDataLoadErrorState from '@/components/admin/shared/AdminDataLoadErrorState';

export function AuditLoadingState() {
    return (
        <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando registros...</span>
        </div>
    );
}

export function AuditErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return <AdminDataLoadErrorState message={error} onRetry={onRetry} minHeightClassName="min-h-[300px]" />;
}
