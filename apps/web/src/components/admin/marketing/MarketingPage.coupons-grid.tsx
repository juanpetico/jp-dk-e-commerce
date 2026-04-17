import React from 'react';
import {
    DollarSign,
    Eye,
    Loader2,
    Plus,
    TrendingUp,
    Trash2,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import { EnrichedCoupon } from './MarketingPage.types';

interface MarketingPageCouponsGridProps {
    loading: boolean;
    error: string | null;
    couponsCount: number;
    filteredCount: number;
    hasActiveFilters: boolean;
    paginatedCoupons: EnrichedCoupon[];
    totalPages: number;
    page: number;
    deletingIds: Set<string>;
    onCreateCoupon: () => void;
    onClearFilters: () => void;
    onEditCoupon: (coupon: EnrichedCoupon) => void;
    onDeleteCoupon: (id: string, code: string) => void;
    formatPrice: (price: number) => string;
}

export default function MarketingPageCouponsGrid({
    loading,
    error,
    couponsCount,
    filteredCount,
    hasActiveFilters,
    paginatedCoupons,
    totalPages,
    page,
    deletingIds,
    onCreateCoupon,
    onClearFilters,
    onEditCoupon,
    onDeleteCoupon,
    formatPrice,
}: MarketingPageCouponsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {!loading && !error && couponsCount === 0 ? (
                <TableEmptyState
                    className="col-span-full"
                    title="Sin cupones todavía"
                    description="Crea tu primer cupón para empezar a medir resultados."
                    actionLabel="Crear primer cupón"
                    onAction={onCreateCoupon}
                />
            ) : filteredCount === 0 && hasActiveFilters ? (
                <TableEmptyState
                    className="col-span-full"
                    title="No hay cupones que coincidan"
                    description="Intenta con otros filtros o limpia la búsqueda."
                    actionLabel="Limpiar filtros"
                    onAction={onClearFilters}
                />
            ) : (
                <>
                    {paginatedCoupons.map((coupon) => {
                        const stats = coupon._stats;
                        const status = coupon._status;
                        const isDeleting = deletingIds.has(coupon.id);

                        return (
                            <div
                                key={coupon.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`Editar cupón ${coupon.code}`}
                                onClick={() => onEditCoupon(coupon)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        onEditCoupon(coupon);
                                    }
                                }}
                                className={`group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md ${
                                    status === 'ACTIVO' ? 'shadow-sm' : 'opacity-80'
                                }`}
                            >
                                <div className="bg-card p-6">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-display text-2xl font-bold leading-none tracking-tighter text-foreground">
                                                {coupon.code}
                                            </h3>
                                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                {coupon.description || 'Sin descripción'}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded border px-2 py-1 text-[9px] font-black uppercase ${
                                                status === 'ACTIVO'
                                                    ? 'border-green-200 bg-green-100 text-green-800'
                                                    : status === 'EXPIRADO'
                                                      ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                                                      : 'border-red-200 bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {status}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-4xl font-black tracking-tighter text-foreground">
                                            {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                            <span className="ml-1 text-sm font-medium tracking-normal text-muted-foreground">OFF</span>
                                        </p>
                                    </div>

                                    <div className="mb-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-lg border border-border/50 bg-muted/50 p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">ROI</span>
                                            </div>
                                            <p className="font-mono text-xl font-black text-primary">
                                                {stats.roi === null ? '—' : `${stats.roi.toFixed(1)}x`}
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-border/50 bg-muted/50 p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                                                <DollarSign className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Ingresos</span>
                                            </div>
                                            <p className="font-mono text-xs font-black text-foreground">{formatPrice(stats.revenue)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-[11px]">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="flex items-center gap-1 font-bold">
                                                <Users className="h-3 w-3" /> Usos
                                            </span>
                                            <span className="font-black text-foreground">
                                                {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}
                                            </span>
                                        </div>

                                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{
                                                    width: `${coupon.maxUses ? Math.min((coupon.usedCount / coupon.maxUses) * 100, 100) : 0}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="flex justify-between pt-1 text-muted-foreground">
                                            <span>Expira</span>
                                            <span className="font-bold">
                                                {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('es-CL') : 'Nunca'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border bg-muted/30 p-4">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">ID: {coupon.id.slice(0, 8)}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onDeleteCoupon(coupon.id, coupon.code);
                                            }}
                                            disabled={isDeleting}
                                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                                            title="Eliminar cupón"
                                            aria-label={`Eliminar cupón ${coupon.code}`}
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onEditCoupon(coupon);
                                            }}
                                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                            title="Ver detalles"
                                            aria-label={`Ver detalles de cupón ${coupon.code}`}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {couponsCount > 0 && (totalPages <= 1 || page === totalPages) && (
                        <button
                            onClick={onCreateCoupon}
                            className="group flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-8 text-muted-foreground transition-all hover:border-primary hover:text-primary"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground transition-colors group-hover:border-primary">
                                <Plus className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Nuevo Cupón</span>
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
