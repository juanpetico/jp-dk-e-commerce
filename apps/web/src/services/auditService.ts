import { AuditLogsResult } from '../types';
import { apiFetch } from '@/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface FetchAuditLogsParams {
    take?: number;
    skip?: number;
    entityType?: string;
    entityId?: string;
    actorId?: string;
    actorQuery?: string;
    createdFrom?: Date;
    createdTo?: Date;
}

export const fetchAuditLogs = async (params: FetchAuditLogsParams = {}): Promise<AuditLogsResult> => {
    const searchParams = new URLSearchParams();

    if (params.take !== undefined) searchParams.set('take', String(params.take));
    if (params.skip !== undefined) searchParams.set('skip', String(params.skip));
    if (params.entityType) searchParams.set('entityType', params.entityType);
    if (params.entityId) searchParams.set('entityId', params.entityId);
    if (params.actorId) searchParams.set('actorId', params.actorId);
    if (params.actorQuery) searchParams.set('actorQuery', params.actorQuery);
    if (params.createdFrom) searchParams.set('createdFrom', params.createdFrom.toISOString());
    if (params.createdTo) searchParams.set('createdTo', params.createdTo.toISOString());

    const query = searchParams.toString();
    const url = `${API_URL}/admin/audit-logs${query ? `?${query}` : ''}`;

    const res = await apiFetch(url, { credentials: 'include' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al cargar los logs de auditoría');
    }

    const json = await res.json();
    return json.data as AuditLogsResult;
};
