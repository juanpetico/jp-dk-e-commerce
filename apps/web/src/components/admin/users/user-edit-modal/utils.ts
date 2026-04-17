import { UserRole } from '@/types';

export const roleLabel = (role: UserRole) => {
    if (role === 'SUPERADMIN') return 'Superadmin';
    if (role === 'ADMIN') return 'Administrador';
    return 'Cliente';
};

export const formatDate = (value: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export const mapAuditValue = (value: string | null) => {
    if (value === null) return '-';
    if (value === 'true') return 'Activo';
    if (value === 'false') return 'Inactivo';
    if (value === 'SUPERADMIN') return 'Superadmin';
    if (value === 'ADMIN') return 'Administrador';
    if (value === 'CLIENT') return 'Cliente';
    return value;
};

export const isPermissionError = (error: unknown) => {
    const message = error instanceof Error ? error.message : '';
    return /forbidden|403|permiso/i.test(message);
};
