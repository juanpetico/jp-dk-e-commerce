import { DateRange } from 'react-day-picker';
import { AuditEntry } from '@/types';

export interface AuditPageFilters {
    entityTypeFilter: string;
    actorQueryInput: string;
    selectedDateRange: DateRange | undefined;
}

export interface AuditPageState {
    logs: AuditEntry[];
    total: number;
    loading: boolean;
    error: string | null;
}
