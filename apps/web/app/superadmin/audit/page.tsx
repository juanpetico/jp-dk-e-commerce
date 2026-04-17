'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Loader2, Search, ShieldAlert, Download } from 'lucide-react';
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
import TablePagination from '@/components/admin/shared/TablePagination';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
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
    { value: 'COUPON', label: 'Cupones' },
    { value: 'STORE_CONFIG', label: 'Configuración' },
];

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
    ROLE_CHANGE:             { label: 'Estado de Usuario',   className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    STATUS_CHANGE:           { label: 'Estado de Usuario',   className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    PRODUCT_CREATED:         { label: 'Estado de Producto',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_DELETED:         { label: 'Estado de Producto',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_PRICE_CHANGE:    { label: 'Estado de Producto',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_STOCK_CHANGE:    { label: 'Estado de Producto',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_PUBLISHED:       { label: 'Estado de Producto',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    PRODUCT_UNPUBLISHED:     { label: 'Estado de Producto',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    ORDER_STATUS_CHANGE:     { label: 'Estado de Orden',     className: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    CATEGORY_CREATED:        { label: 'Estado de Categoría', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_PUBLISHED:      { label: 'Estado de Categoría', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_UNPUBLISHED:    { label: 'Estado de Categoría', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    CATEGORY_DELETED:        { label: 'Estado de Categoría', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
    STORE_CONFIG_CHANGE:     { label: 'Estado de Configuración', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    /** BG-VIOLET-200 PARA QUE SE NOTE EN LIGHT     */
    COUPON_CREATED:          { label: 'Estado de Cupón',     className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    COUPON_UPDATED:          { label: 'Estado de Cupón',     className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    COUPON_DELETED:          { label: 'Estado de Cupón',     className: 'bg-violet-200 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' },
    PRODUCT_SALE_CHANGE:     { label: 'Estado de Producto',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
};

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

const SALE_FIELD_LABELS: Record<string, string> = {
    isSale:          'En oferta',
    originalPrice:   'Precio original',
    discountPercent: 'Descuento %',
};

const COUPON_FIELD_LABELS: Record<string, string> = {
    code:        'Código',
    value:       'Valor',
    type:        'Tipo',
    isActive:    'Activo',
    description: 'Descripción',
    minAmount:   'Monto mínimo',
    maxUses:     'Usos máximos',
    isPublic:    'Público',
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

const getProductName = (entry: AuditEntry, fallback?: string | null) => {
    const metadataName = entry.metadata?.productName as string | undefined;
    if (metadataName) return metadataName;
    if (fallback) return fallback;
    return entry.entityId.slice(0, 8);
};

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
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{(metadata?.targetEmail as string | undefined) ?? 'Sin correo'}</span>
                    <div className="flex items-center gap-0.5 flex-wrap">
                        <OldVal>{ROLE_LABELS[oldValue ?? ''] ?? oldValue ?? '—'}</OldVal>
                        <DiffArrow />
                        <NewVal className="text-blue-600 dark:text-blue-400">
                            {ROLE_LABELS[newValue ?? ''] ?? newValue ?? '—'}
                        </NewVal>
                    </div>
                </div>
            );

        case 'STATUS_CHANGE': {
            const wasActive = oldValue === 'true';
            const isActive = newValue === 'true';
            const reason = metadata?.deactivationReason as string | undefined;
            const targetEmail = metadata?.targetEmail as string | undefined;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{targetEmail ?? 'Sin correo'}</span>
                    <div className="flex items-center gap-0.5 flex-wrap">
                        <OldVal>{wasActive ? 'Activo' : 'Inactivo'}</OldVal>
                        <DiffArrow />
                        <NewVal className={isActive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                            {isActive ? 'Activo' : 'Inactivo'}
                        </NewVal>
                    </div>
                    {reason && (
                        <span className="text-[10px] text-muted-foreground italic">{reason}</span>
                    )}
                </div>
            );
        }

        case 'PRODUCT_PRICE_CHANGE': {
            const productName = getProductName(entry);
            return (
                <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground mr-1">{productName}</span>
                    <span className="text-[10px] text-muted-foreground">Precio:</span>
                    <OldVal>{formatCLP(oldValue ?? '0')}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-purple-600 dark:text-purple-400">
                        {formatCLP(newValue ?? '0')}
                    </NewVal>
                </div>
            );
        }

        case 'PRODUCT_STOCK_CHANGE': {
            const size = metadata?.size as string | undefined;
            const productName = getProductName(entry);
            return (
                <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground mr-1">{productName}</span>
                    {size && <span className="text-[10px] text-muted-foreground">Talla: {size}</span>}
                    <OldVal>{oldValue ?? '—'}</OldVal>
                    <DiffArrow />
                    <NewVal className="text-cyan-600 dark:text-cyan-400">{newValue ?? '—'}</NewVal>
                </div>
            );
        }

        case 'PRODUCT_PUBLISHED':
        case 'PRODUCT_UNPUBLISHED': {
            const name = getProductName(entry);
            const isPublished = action === 'PRODUCT_PUBLISHED';
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <NewVal className={isPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
                        {isPublished ? 'Publicado' : 'No publicado'}
                    </NewVal>
                </div>
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
            const name = getProductName(entry, newValue);
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <NewVal className="text-emerald-600 dark:text-emerald-400">Creado</NewVal>
                </div>
            );
        }

        case 'PRODUCT_DELETED': {
            const name = getProductName(entry, oldValue);
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Producto:</span>
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <NewVal className="text-destructive">Eliminado</NewVal>
                </div>
            );
        }

        case 'CATEGORY_CREATED':
            return <span className="text-xs text-muted-foreground">{newValue ?? '—'}</span>;

        case 'CATEGORY_PUBLISHED':
        case 'CATEGORY_UNPUBLISHED': {
            const wasVisible = oldValue === 'true';
            const isVisible = newValue === 'true';
            const categoryName = (metadata?.categoryName as string | undefined) ?? 'Categoría';
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">{categoryName}</span>
                    <div className="flex items-center gap-0.5 flex-wrap">
                        <OldVal>{wasVisible ? 'Visible' : 'Oculta'}</OldVal>
                        <DiffArrow />
                        <NewVal className={isVisible ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}>
                            {isVisible ? 'Visible' : 'Oculta'}
                        </NewVal>
                    </div>
                </div>
            );
        }

        case 'CATEGORY_DELETED':
            return <span className="text-xs text-muted-foreground line-through opacity-70">{oldValue ?? '—'}</span>;

        case 'COUPON_CREATED': {
            const couponCode = (metadata?.couponCode as string | undefined) ?? newValue;
            const couponValue = metadata?.value as string | undefined;
            const couponType = metadata?.type as string | undefined;
            const desc = metadata?.description as string | undefined;
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <NewVal className="text-emerald-600 dark:text-emerald-400">Creado</NewVal>
                        <span className="text-[10px] text-muted-foreground mr-1 ">{couponCode ?? '—'}</span>
                    </div>
                    {(couponType || couponValue) && (
                        <div className="flex items-center gap-1.5">
                            {couponType && <span className="text-[10px] text-muted-foreground">{couponType === 'PERCENTAGE' ? 'Descuento %' : 'Monto fijo'}</span>}
                            {couponValue && (
                                <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
                                    {couponType === 'PERCENTAGE' ? `${couponValue}%` : formatCLP(couponValue)}
                                </span>
                            )}
                        </div>
                    )}
                    {desc && <span className="text-[10px] text-muted-foreground italic">{desc}</span>}
                </div>
            );
        }

        case 'COUPON_UPDATED': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try { oldObj = JSON.parse(oldValue ?? '{}'); } catch { /* empty */ }
            try { newObj = JSON.parse(newValue ?? '{}'); } catch { /* empty */ }
            const couponCode = metadata?.couponCode as string | undefined;
            const keys = Object.keys(newObj);
            return (
                <div className="flex flex-col gap-0.5">
                    {couponCode && <span className="text-[10px] font-mono font-bold text-muted-foreground mb-0.5">{couponCode}</span>}
                    {keys.map((key) => (
                        <div key={key} className="flex items-center gap-0.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground mr-1">{COUPON_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-violet-600 dark:text-violet-400">
                                {String(newObj[key] ?? '—')}
                            </NewVal>
                        </div>
                    ))}
                </div>
            );
        }

        case 'COUPON_DELETED': {
            const deletedCode = (metadata?.couponCode as string | undefined) ?? oldValue;
            const deletedDesc = metadata?.description as string | undefined;
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <NewVal className="text-destructive">Eliminado</NewVal>
                        <span className="text-xs font-mono text-muted-foreground line-through opacity-70">{deletedCode ?? '—'}</span>
                    </div>
                    {deletedDesc && <span className="text-[10px] text-muted-foreground italic opacity-70">{deletedDesc}</span>}
                </div>
            );
        }

        case 'PRODUCT_SALE_CHANGE': {
            let oldObj: Record<string, unknown> = {};
            let newObj: Record<string, unknown> = {};
            try { oldObj = JSON.parse(oldValue ?? '{}'); } catch { /* empty */ }
            try { newObj = JSON.parse(newValue ?? '{}'); } catch { /* empty */ }
            const productName = getProductName(entry);
            const keys = Object.keys(newObj);
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">Producto:</span>
                        <span className="text-xs text-muted-foreground">{productName}</span>
                    </div>
                    {keys.map((key) => (
                        <div key={key} className="flex items-center gap-0.5 flex-wrap">
                            <span className="text-[10px] text-muted-foreground mr-1">{SALE_FIELD_LABELS[key] ?? key}:</span>
                            <OldVal>{String(oldObj[key] ?? '—')}</OldVal>
                            <DiffArrow />
                            <NewVal className="text-pink-600 dark:text-pink-400">
                                {String(newObj[key] ?? '—')}
                            </NewVal>
                        </div>
                    ))}
                </div>
            );
        }

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

    const visibleLogs = logs;

    const hasFilters = entityTypeFilter !== 'ALL' || debouncedActorQuery || !!selectedDateRange?.from;

    const clearFilters = () => {
        setEntityTypeFilter('ALL');
        setActorQueryInput('');
        setSelectedDateRange(undefined);
    };

    return (
        <div className="animate-fade-in pb-10 text-foreground space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                            Auditoría
                        </h1>
                        {total > 0 && <span className="text-sm font-bold text-muted-foreground">{total} {total === 1 ? 'registro' : 'registros'}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Registro de todas las acciones de alto impacto en el sistema.
                    </p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={actorQueryInput}
                        onChange={(e) => setActorQueryInput(e.target.value)}
                        placeholder="Buscar por nombre o correo..."
                        className="pl-10 font-mono text-sm w-full"
                    />
                </div>

                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
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

                <div className="w-full md:w-auto">
                    <DatePickerWithRange
                        date={selectedDateRange}
                        setDate={setSelectedDateRange}
                    />
                </div>

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs shrink-0">
                        Limpiar filtros
                    </Button>
                )}
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
                        <TableEmptyState
                            title={hasFilters ? 'Sin resultados' : 'No hay registros'}
                            description={hasFilters
                                ? 'Ningún registro coincide con los filtros aplicados.'
                                : 'Cuando se registren acciones de alto impacto, aparecerán aquí.'}
                            actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
                            onAction={hasFilters ? clearFilters : undefined}
                        />
                    ) : (
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="w-[18%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="w-[28%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Actor
                                    </TableHead>
                                    <TableHead className="w-[16%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Acción
                                    </TableHead>
                                    <TableHead className="w-[38%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
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
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate text-xs font-semibold text-foreground">
                                                    {log.actor.name ?? 'Sin nombre'}
                                                </span>
                                                <span className="truncate text-[10px] font-mono text-muted-foreground">
                                                    {log.actor.email}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Acción */}
                                        <TableCell className="px-6 py-4">
                                            <ActionBadge action={log.action} />
                                        </TableCell>

                                        {/* Detalles */}
                                        <TableCell className="px-6 py-4 break-words">
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
