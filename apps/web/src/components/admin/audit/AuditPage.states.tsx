import React from 'react';
import AdminDataLoadErrorState from '@/components/admin/shared/AdminDataLoadErrorState';
import AdminSectionLoadingSpinner from '@/components/admin/shared/AdminSectionLoadingSpinner';

export function AuditLoadingState() {
    return <AdminSectionLoadingSpinner label="Cargando registros..." />;
}

export function AuditErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return <AdminDataLoadErrorState message={error} onRetry={onRetry} minHeightClassName="min-h-[300px]" />;
}
