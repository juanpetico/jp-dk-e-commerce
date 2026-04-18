'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import TablePagination from '@/components/admin/shared/TablePagination';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import { fetchAuditLogs } from '@/services/auditService';
import { exportRowsToExcel } from '@/services/exportExcelService';
import { exportRowsToPdf } from '@/services/exportPdfService';
import { AuditEntry } from '@/types';
import { toast } from 'sonner';
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

    const getCurrentScopeLabel = () => (hasFilters ? 'filtros actuales' : 'pagina actual');

    const getExportItems = async (scope: 'current' | 'all') => {
        if (total === 0) {
            return null;
        }

        const baseFilters = {
            ...(entityTypeFilter !== 'ALL' ? { entityType: entityTypeFilter } : {}),
            ...(debouncedActorQuery ? { actorQuery: debouncedActorQuery } : {}),
            ...(fromTimestamp && toTimestamp
                ? {
                      createdFrom: new Date(fromTimestamp),
                      createdTo: new Date(toTimestamp),
                  }
                : {}),
        };

        const scopeTotal = scope === 'current' ? (hasFilters ? total : logs.length) : total;
        const scopeSkip = scope === 'current' && !hasFilters ? skip : 0;

        const pageSize = 100;
        const requests = [];
        for (let currentSkip = scopeSkip; currentSkip < scopeSkip + scopeTotal; currentSkip += pageSize) {
            requests.push(
                fetchAuditLogs({
                    ...baseFilters,
                    take: Math.min(pageSize, scopeSkip + scopeTotal - currentSkip),
                    skip: currentSkip,
                })
            );
        }

        const pages = await Promise.all(requests);
        const items = pages.flatMap((page) => page.items);

        if (items.length === 0) {
            toast.error('No hay registros para exportar');
            return null;
        }

        return items;
    };

    const handleExportPdf = async () => {
        try {
            const items = await getExportItems('current');
            if (!items) return;

            const rows = items.map((entry) => ({
                Fecha: new Date(entry.createdAt).toLocaleString('es-CL'),
                Actor: entry.actor.name || 'Sin nombre',
                Email: entry.actor.email,
                Accion: entry.action,
                Entidad: entry.entityType,
                Detalle: entry.newValue || entry.oldValue || '-',
            }));

            exportRowsToPdf(rows, {
                fileNameBase: 'auditoria',
                title: 'REPORTE DE AUDITORIA',
            });
            toast.success(`Reporte PDF generado (${rows.length} registros, ${getCurrentScopeLabel()})`);
        } catch {
            toast.error('No se pudo exportar el reporte de auditoria');
        }
    };

    const handleExportExcel = async () => {
        try {
            const items = await getExportItems('current');
            if (!items) return;

            exportRowsToExcel(
                items.map((entry) => ({
                    Fecha: new Date(entry.createdAt).toLocaleString('es-CL'),
                    Actor: entry.actor.name || 'Sin nombre',
                    Email: entry.actor.email,
                    Accion: entry.action,
                    Entidad: entry.entityType,
                    'ID Entidad': entry.entityId,
                    Detalle: entry.newValue || entry.oldValue || '-',
                })),
                {
                    fileNameBase: 'auditoria',
                    sheetName: 'Auditoria',
                }
            );

            toast.success(`Archivo Excel generado (${items.length} registros, ${getCurrentScopeLabel()})`);
        } catch {
            toast.error('No se pudo exportar el reporte de auditoria en Excel');
        }
    };

    const handleExportPdfAll = async () => {
        try {
            const items = await getExportItems('all');
            if (!items) return;

            exportRowsToPdf(
                items.map((entry) => ({
                    Fecha: new Date(entry.createdAt).toLocaleString('es-CL'),
                    Actor: entry.actor.name || 'Sin nombre',
                    Email: entry.actor.email,
                    Accion: entry.action,
                    Entidad: entry.entityType,
                    Detalle: entry.newValue || entry.oldValue || '-',
                })),
                {
                    fileNameBase: 'auditoria',
                    title: 'REPORTE DE AUDITORIA',
                }
            );
            toast.success(`Reporte PDF generado (${items.length} registros, todos)`);
        } catch {
            toast.error('No se pudo exportar el reporte de auditoria');
        }
    };

    const handleExportExcelAll = async () => {
        try {
            const items = await getExportItems('all');
            if (!items) return;

            exportRowsToExcel(
                items.map((entry) => ({
                    Fecha: new Date(entry.createdAt).toLocaleString('es-CL'),
                    Actor: entry.actor.name || 'Sin nombre',
                    Email: entry.actor.email,
                    Accion: entry.action,
                    Entidad: entry.entityType,
                    'ID Entidad': entry.entityId,
                    Detalle: entry.newValue || entry.oldValue || '-',
                })),
                {
                    fileNameBase: 'auditoria',
                    sheetName: 'Auditoria',
                }
            );

            toast.success(`Archivo Excel generado (${items.length} registros, todos)`);
        } catch {
            toast.error('No se pudo exportar el reporte de auditoria en Excel');
        }
    };

    return (
        <div className="animate-fade-in space-y-6 pb-10 text-foreground">
            <AuditPageHeader
                total={total}
                loading={loading}
                currentExportCount={hasFilters ? total : logs.length}
                onExportPdf={() => void handleExportPdf()}
                onExportExcel={() => void handleExportExcel()}
                onExportPdfAll={() => void handleExportPdfAll()}
                onExportExcelAll={() => void handleExportExcelAll()}
                showAllExportOptions={!hasFilters && total > logs.length}
            />

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
