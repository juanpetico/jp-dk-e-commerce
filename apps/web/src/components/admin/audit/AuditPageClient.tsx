'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import TablePagination from '@/components/admin/shared/TablePagination';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import { fetchAuditLogs } from '@/services/auditService';
import { AuditEntry } from '@/types';
import {
    ITEMS_PER_PAGE_DEFAULT,
} from './AuditPage.constants';
import AuditPageFilters from './AuditPage.filters';
import AuditPageHeader from './AuditPage.header';
import AuditPageTable from './AuditPage.table';
import { AuditErrorState, AuditLoadingState } from './AuditPage.states';

export default function AuditPageClient() {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [entityTypeFilter, setEntityTypeFilter] = useState('ALL');
    const [actorQueryInput, setActorQueryInput] = useState('');
    const [debouncedActorQuery, setDebouncedActorQuery] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedActorQuery(actorQueryInput.trim()), 400);
        return () => clearTimeout(timeout);
    }, [actorQueryInput]);

    useEffect(() => {
        setCurrentPage(1);
    }, [entityTypeFilter, debouncedActorQuery, selectedDateRange]);

    const skip = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);

    const fromTimestamp = useMemo(() => {
        if (!selectedDateRange?.from) return undefined;
        return startOfDay(selectedDateRange.from).getTime();
    }, [selectedDateRange?.from?.getTime()]);

    const toTimestamp = useMemo(() => {
        if (selectedDateRange?.to) return endOfDay(selectedDateRange.to).getTime();
        if (selectedDateRange?.from) return endOfDay(selectedDateRange.from).getTime();
        return undefined;
    }, [selectedDateRange?.from?.getTime(), selectedDateRange?.to?.getTime()]);

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchAuditLogs({
                take: itemsPerPage,
                skip,
                ...(entityTypeFilter !== 'ALL' ? { entityType: entityTypeFilter } : {}),
                ...(debouncedActorQuery ? { actorQuery: debouncedActorQuery } : {}),
                ...(fromTimestamp && toTimestamp
                    ? {
                          createdFrom: new Date(fromTimestamp),
                          createdTo: new Date(toTimestamp),
                      }
                    : {}),
            });
            setLogs(result.items);
            setTotal(result.total);
        } catch (requestError) {
            console.error('Error loading audit logs:', requestError);
            setError('No se pudo cargar el registro de auditoria.');
        } finally {
            setLoading(false);
        }
    }, [skip, itemsPerPage, entityTypeFilter, debouncedActorQuery, fromTimestamp, toTimestamp]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const hasFilters = entityTypeFilter !== 'ALL' || !!debouncedActorQuery || !!selectedDateRange?.from;

    const clearFilters = () => {
        setEntityTypeFilter('ALL');
        setActorQueryInput('');
        setSelectedDateRange(undefined);
    };

    return (
        <div className="animate-fade-in space-y-6 pb-10 text-foreground">
            <AuditPageHeader total={total} />

            <AuditPageFilters
                actorQueryInput={actorQueryInput}
                entityTypeFilter={entityTypeFilter}
                selectedDateRange={selectedDateRange}
                hasFilters={hasFilters}
                onActorQueryInputChange={setActorQueryInput}
                onEntityTypeFilterChange={setEntityTypeFilter}
                onDateRangeChange={setSelectedDateRange}
                onClearFilters={clearFilters}
            />

            <div className="overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
                <div className="overflow-x-auto">
                    {loading ? (
                        <AuditLoadingState />
                    ) : error ? (
                        <AuditErrorState error={error} onRetry={loadLogs} />
                    ) : logs.length === 0 ? (
                        <TableEmptyState
                            title={hasFilters ? 'Sin resultados' : 'No hay registros'}
                            description={
                                hasFilters
                                    ? 'Ningun registro coincide con los filtros aplicados.'
                                    : 'Cuando se registren acciones de alto impacto, apareceran aqui.'
                            }
                            actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
                            onAction={hasFilters ? clearFilters : undefined}
                        />
                    ) : (
                        <AuditPageTable logs={logs} />
                    )}
                </div>

                {!loading && !error && total > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalItems={total}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(items) => {
                            setItemsPerPage(items);
                            setCurrentPage(1);
                        }}
                        className="border-t border-border"
                    />
                )}
            </div>
        </div>
    );
}
