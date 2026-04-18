import { AuditEntry } from '@/types';

export const formatDate = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export const formatCLP = (value: string) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(value));

export const getProductName = (entry: AuditEntry, fallback?: string | null) => {
    const metadataName = entry.metadata?.productName as string | undefined;
    if (metadataName) return metadataName;
    if (fallback) return fallback;
    return entry.entityId.slice(0, 8);
};
