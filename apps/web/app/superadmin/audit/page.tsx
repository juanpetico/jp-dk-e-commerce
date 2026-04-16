'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Loader2, Search, ShieldAlert } from 'lucide-react';
import { endOfDay, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { DatePickerWithRange } from '@/components/ui/DateRangePicker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import TablePagination from '@/components/admin/TablePagination';
import { AuditEntry } from '@/types';
import { fetchAuditLogs } from '@/services/auditService';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE_DEFAULT = 20;

const ENTITY_TYPE_OPTIONS = [
    { value: 'ALL', label: 'Todas las entidades' },
    { value: 'USER', label: 'Usuarios' },
    { value: 'PRODUCT', label: 'Productos' },
    { value: 'ORDER', label: 'Órdenes' },
    { value: 'CATEGORY', label: 'Categorías' },
    { value: 'STORE_CONFIG', label: 'Configuración' },
];

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
    ROLE_CHANGE:             { label: 'Cambio de Rol',       className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    STATUS_CHANGE:           { label: 'Cambio de Estado',    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    PRODUCT_CREATED:         { label: 'Producto Creado',     className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    PRODUCT_DELETED:         { label: 'Producto Eliminado',  className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    PRODUCT_PRICE_CHANGE:    { label: 'Cambio de Precio',    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    PRODUCT_STOCK_CHANGE:    { label: 'Cambio de Stock',     className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
    PRODUCT_PUBLISHED:       { label: 'Publicado',           className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_UNPUBLISHED:     { label: 'Despublicado',        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    ORDER_STATUS_CHANGE:     { label: 'Estado de Orden',     className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    CATEGORY_CREATED:        { label: 'Categoría Creada',    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    CATEGORY_DELETED:        { label: 'Categoría Eliminada', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    STORE_CONFIG_CHANGE:     { label: 'Config. Tienda',      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
};

const ACTION_FILTER_OPTIONS = [
    { value: 'ALL', label: 'Todas las acciones' },
    ...Object.entries(ACTION_CONFIG).map(([value, { label }]) => ({ value, label })),
];

const ORDER_STATUS_LABELS: Record<string, string> = {
    PENDING:   'Pendiente',
    CONFIRMED: 'Confirmado',
    SHIPPED:   'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
};

const ROLE_LABELS: Record<string, string> = {
    CLIENT:     'Cliente',
    ADMIN:      'Admin',
    SUPERADMIN: 'Superadmin',
};

const CONFIG_FIELD_LABELS: Record<string, string> = {
    freeShippingThreshold: 'Envío gratis desde',
    baseShippingCost:      'Costo de envío',
    defaultTaxRate:        'IVA',
    lowStockThreshold:     'Stock mínimo',
    vipThreshold:          'Umbral VIP',
    vipCouponCode:         'Código VIP',
    vipCouponType:         'Tipo VIP',
    vipCouponValue:        'Valor VIP',
    vipRewardMessage:      'Mensaje VIP',
    welcomeCouponCode:     'Código Bienvenida',
    welcomeCouponType:     'Tipo Bienvenida',
    welcomeCouponValue:    'Valor Bienvenida',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatCLP = (value: string) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(value));

// ─── Sub-components ───────────────────────────────────────────────────────────

const ActionBadge = ({ action }: { action: string }) => {
    const config = ACTION_CONFIG[action] ?? { label: action, className: 'bg-muted text-muted-foreground' };
    return (
        <span className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.className}`}>
            {config.label}
        </span>
    );
};

const DiffArrow = () => (
    <ArrowRight className="mx-1 h-3 w-3 flex-shrink-0 text-muted-foreground" />
);

const OldVal = ({ children }: { children: React.ReactNode }) => (
    <span className="text-xs text-muted-foreground line-through">{children}</span>
);

const NewVal = ({ children, className = 'text-foreground' }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-xs font-medium ${className}`}>{children}</span>
);

const ChangeDetail = ({ entry }: { entry: AuditEntry }) => {
    const { action, oldValue, newValue, metadata } = entry;

    switch (action) {
        case 'ROLE_CHANGE':
            return (
                <div className="flex items-center gap-0.5 flex-wrap">
                    <OldVal>{ROLE_LABELS[oldValue ?? ''] ?? oldValue ?? '—'}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-blue-600 dark:text-blue-400">
                        {ROLE_LABELS[newValue ?? ''] ?? newValue ?? '—'}
                    </NewVal>
                </div>
            );

        case 'STATUS_CHANGE': {
            const wasActive = oldValue === 'true';
            const isActive = newValue === 'true';
            const reason = metadata?.deactivationReason as string | undefined;
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-0.5 flex-wrap">
                        <OldVal>{wasActive ? 'Activo' : 'Inactivo'}</OldVal>
                        <DiffArrow />
                        <NewVal className={isActive ? 'text-green-600 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}>
                            {isActive ? 'Activo' : 'Inactivo'}
                        </NewVal>
                    </div>
                    {reason && (
                        <span className="text-[10px] text-muted-foreground italic">{reason}</span>
                    )}
                </div>
            );
        }

        case 'PRODUCT_PRICE_CHANGE':
            return (
                <div className="flex items-center gap-0.5 flex-wrap">
                    <OldVal>{formatCLP(oldValue ?? '0')}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-purple-600 dark:text-purple-400">
                        {formatCLP(newValue ?? '0')}
                    </NewVal>
                </div>
            );

        case 'PRODUCT_STOCK_CHANGE': {
            const size = metadata?.size as string | undefined;
            return (
                <div className="flex items-center gap-0.5 flex-wrap">
                    {size && <span className="text-[10px] text-muted-foreground mr-1">{size}</span>}
                    <OldVal>{oldValue ?? '—'}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-cyan-600 dark:text-cyan-400">{newValue ?? '—'}</NewVal>
                </div>
            );
        }

        case 'PRODUCT_PUBLISHED':
        case 'PRODUCT_UNPUBLISHED': {
            const name = metadata?.productName as string | undefined;
            return (
                <span className="text-xs text-muted-foreground">
                    {name ?? entry.entityId.slice(0, 8)}
                </span>
            );
        }

        case 'ORDER_STATUS_CHANGE':
            return (
                <div className="flex items-center gap-0.5 flex-wrap">
                    <OldVal>{ORDER_STATUS_LABELS[oldValue ?? ''] ?? oldValue ?? '—'}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-indigo-600 dark:text-indigo-400">
                        {ORDER_STATUS_LABELS[newValue ?? ''] ?? newValue ?? '—'}
                    </NewVal>
                </div>
            );

        case 'STORE_CONFIG_CHANGE': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try { oldObj = JSON.parse(oldValue ?? '{}'); } catch { /* empty */ }
            try { newObj = JSON.parse(newValue ?? '{}'); } catch { /* empty */ }
            const keys = Object.keys(newObj);
            return (
                <div className="flex flex-col gap-0.5">
                    {keys.map((key) => (
                        <div key={key} className="flex items-center gap-0.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground mr-1">{CONFIG_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-amber-600 dark:text-amber-400">
                                {String(newObj[key] ?? '—')}
                            </NewVal>
                        </div>
                    ))}
                </div>
            );
        }

        case 'PRODUCT_CREATED': {
            const name = newValue ?? metadata?.productName as string | undefined;
            return <span className="text-xs text-muted-foreground">{name ?? '—'}</span>;
        }

        case 'PRODUCT_DELETED': {
            const name = oldValue ?? metadata?.productName as string | undefined;
            return <span className="text-xs text-muted-foreground line-through opacity-70">{name ?? '—'}</span>;
        }

        case 'CATEGORY_CREATED':
            return <span className="text-xs text-muted-foreground">{newValue ?? '—'}</span>;

        case 'CATEGORY_DELETED':
            return <span className="text-xs text-muted-foreground line-through opacity-70">{oldValue ?? '—'}</span>;

        default:
            if (oldValue || newValue) {
                return (
                    <div className="flex items-center gap-0.5 flex-wrap">
                        {oldValue && <OldVal>{oldValue}</OldVal>}
                        {oldValue && newValue && <DiffArrow />}
                        {newValue && <NewVal>{newValue}</NewVal>}
                    </div>
                );
            }
            return <span className="text-xs text-muted-foreground">—</span>;
    }
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [entityTypeFilter, setEntityTypeFilter] = useState('ALL');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [actorQueryInput, setActorQueryInput] = useState('');
    const [debouncedActorQuery, setDebouncedActorQuery] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);

    // Debounce actor search input
    useEffect(() => {
        const t = setTimeout(() => setDebouncedActorQuery(actorQueryInput.trim()), 400);
        return () => clearTimeout(t);
    }, [actorQueryInput]);

    // Reset to page 1 when server-side filters change
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
        } catch (err) {
            console.error('Error loading audit logs:', err);
            setError('No se pudo cargar el registro de auditoría.');
        } finally {
            setLoading(false);
        }
    }, [skip, itemsPerPage, entityTypeFilter, debouncedActorQuery, fromTimestamp, toTimestamp]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    // Client-side action filter applied on top of server results
    const visibleLogs = useMemo(
        () => actionFilter === 'ALL' ? logs : logs.filter((l) => l.action === actionFilter),
        [logs, actionFilter],
    );

    const hasFilters = entityTypeFilter !== 'ALL' || debouncedActorQuery || actionFilter !== 'ALL' || selectedDateRange?.from;

    const clearFilters = () => {
        setEntityTypeFilter('ALL');
        setActionFilter('ALL');
        setActorQueryInput('');
        setSelectedDateRange(undefined);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 text-foreground">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Auditoría
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registro de todas las acciones de alto impacto en el sistema.
                    </p>
                </div>
                <div className="flex flex-col items-end text-right">
                    <span className="text-lg font-bold leading-none text-foreground">{total}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                        {total === 1 ? 'registro' : 'registros'}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={actorQueryInput}
                        onChange={(e) => setActorQueryInput(e.target.value)}
                        placeholder="Buscar por nombre o correo..."
                        className="pl-10 font-mono text-sm"
                    />
                </div>

                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Tipo de entidad" />
                        </SelectTrigger>
                        <SelectContent>
                            {ENTITY_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Tipo de acción" />
                        </SelectTrigger>
                        <SelectContent>
                            {ACTION_FILTER_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="w-full md:w-auto">
                        <DatePickerWithRange
                            date={selectedDateRange}
                            setDate={setSelectedDateRange}
                        />
                    </div>

                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Cargando registros...</span>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-6 text-center text-destructive">
                            <ShieldAlert className="h-8 w-8" />
                            <p>{error}</p>
                            <Button variant="outline" onClick={loadLogs}>Reintentar</Button>
                        </div>
                    ) : visibleLogs.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
                            <ShieldAlert className="h-8 w-8" />
                            <p className="font-medium">No hay registros</p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="text-sm underline font-bold hover:opacity-70 transition-opacity">
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Actor
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Acción
                                    </TableHead>
                                    <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Detalles
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleLogs.map((log) => (
                                    <TableRow key={log.id} className="transition-colors hover:bg-muted/40">
                                        {/* Fecha */}
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">
                                                    {formatDate(log.createdAt).split(',')[0]}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleTimeString('es-CL', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Actor */}
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {log.actor.name ?? 'Sin nombre'}
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                    {log.actor.email}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Acción */}
                                        <TableCell className="px-6 py-4">
                                            <ActionBadge action={log.action} />
                                        </TableCell>

                                        {/* Detalles */}
                                        <TableCell className="px-6 py-4">
                                            <ChangeDetail entry={log} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {!loading && !error && total > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalItems={total}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                        className="border-t border-border"
                    />
                )}
            </div>
        </div>
    );
}
