'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Plus, Loader2, TrendingUp, DollarSign, Users, Trash2, Eye, AlertTriangle, RefreshCw, Tag, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/couponService';
import { fetchAllOrders } from '@/services/orderService';
import { Coupon, Order } from '@/types';
import { toast } from 'sonner';
import CouponModal from '@/components/admin/CouponModal';
import TriggersConfigCard from '@/components/admin/TriggersConfigCard';
import { shopConfigService, StoreConfig } from '@/services/shopConfigService';
import SonnerConfirm from '@/components/ui/SonnerConfirm';
import { getCouponStatus, getCouponStats } from '@/lib/coupon-utils';

const PAGE_SIZE = 9;

export default function MarketingPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [config, setConfig] = useState<StoreConfig | null>(null);

    // Filter / sort / pagination state
    const [searchRaw, setSearchRaw] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVO' | 'EXPIRADO' | 'INACTIVO'>('ALL');
    const [filterType, setFilterType] = useState<'ALL' | 'PERCENTAGE' | 'FIXED_AMOUNT'>('ALL');
    const [sortKey, setSortKey] = useState<'code' | 'usedCount' | 'roi' | 'revenue' | 'createdAt'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { }
    });

    // Debounce searchRaw → searchQuery
    useEffect(() => {
        const t = setTimeout(() => setSearchQuery(searchRaw), 300);
        return () => clearTimeout(t);
    }, [searchRaw]);

    // Reset page when filters/sort change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, filterStatus, filterType, sortKey, sortDir]);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const [couponsData, ordersData, configData] = await Promise.all([
                fetchAllCoupons(),
                fetchAllOrders(),
                shopConfigService.getConfig()
            ]);
            setCoupons(couponsData);
            setOrders(ordersData);
            setConfig(configData);
        } catch (err) {
            setError('Error al cargar datos de marketing');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    // Enriched coupons with status and stats
    const enrichedCoupons = useMemo(() =>
        coupons.map(c => ({
            ...c,
            _status: getCouponStatus(c),
            _stats: getCouponStats(c.id, orders),
        })),
    [coupons, orders]);

    const filteredSorted = useMemo(() => {
        let r = enrichedCoupons;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            r = r.filter(c => c.code.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
        }
        if (filterStatus !== 'ALL') r = r.filter(c => c._status === filterStatus);
        if (filterType !== 'ALL') r = r.filter(c => c.type === filterType);
        return [...r].sort((a, b) => {
            const getVal = (x: typeof a) => {
                if (sortKey === 'code') return x.code;
                if (sortKey === 'usedCount') return x.usedCount;
                if (sortKey === 'roi') return x._stats.roi ?? -Infinity;
                if (sortKey === 'revenue') return x._stats.revenue;
                return x.id; // createdAt proxy (CUID is time-ordered)
            };
            const [va, vb] = [getVal(a), getVal(b)];
            return (va < vb ? -1 : va > vb ? 1 : 0) * (sortDir === 'asc' ? 1 : -1);
        });
    }, [enrichedCoupons, searchQuery, filterStatus, filterType, sortKey, sortDir]);

    const paginated = useMemo(() =>
        filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredSorted, page]);

    const totalPages = Math.ceil(filteredSorted.length / PAGE_SIZE);

    const handleSaveCoupon = async (couponData: Partial<Coupon> & { vipThreshold?: number; vipRewardMessage?: string }) => {
        try {
            const { vipThreshold, vipRewardMessage, ...cleanCouponData } = couponData;

            if (editingCoupon) {
                const originalSnapshot = {
                    code: editingCoupon.code,
                    type: editingCoupon.type,
                    value: editingCoupon.value,
                    description: editingCoupon.description,
                    minAmount: editingCoupon.minAmount,
                    maxUses: editingCoupon.maxUses,
                    maxUsesPerUser: editingCoupon.maxUsesPerUser,
                    startDate: editingCoupon.startDate,
                    endDate: editingCoupon.endDate,
                    isActive: editingCoupon.isActive,
                };

                await updateCoupon(editingCoupon.id, cleanCouponData);

                if (config) {
                    const isWelcome = config.welcomeCouponCode && editingCoupon.code.toUpperCase() === config.welcomeCouponCode.toUpperCase();
                    const isVIP = config.vipCouponCode && editingCoupon.code.toUpperCase() === config.vipCouponCode.toUpperCase();

                    if (isWelcome || isVIP) {
                        try {
                            if (isWelcome) {
                                await shopConfigService.updateConfig({
                                    welcomeCouponCode: cleanCouponData.code?.toUpperCase(),
                                    welcomeCouponType: cleanCouponData.type,
                                    welcomeCouponValue: cleanCouponData.value
                                });
                                toast.info('Configuración de bienvenida actualizada');
                            } else if (isVIP) {
                                await shopConfigService.updateConfig({
                                    vipCouponCode: cleanCouponData.code?.toUpperCase(),
                                    vipCouponType: cleanCouponData.type,
                                    vipCouponValue: cleanCouponData.value,
                                    vipThreshold: vipThreshold,
                                    vipRewardMessage: vipRewardMessage
                                });
                                toast.info('Configuración VIP actualizada');
                            }
                        } catch (syncError) {
                            try {
                                await updateCoupon(editingCoupon.id, originalSnapshot);
                                toast.error('Error al sincronizar configuración. Los cambios en el cupón fueron revertidos.');
                            } catch (rollbackError) {
                                toast.error('Error crítico: no se pudo revertir el cupón. Recarga la página y verifica manualmente.', { duration: 10000 });
                            }
                            loadData();
                            return;
                        }
                    }
                }

                toast.success('Cupón actualizado');
            } else {
                await createCoupon(cleanCouponData);
                toast.success('Cupón creado exitosamente');
            }
            loadData();
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Error al procesar el cupón');
        }
    };

    const confirmDelete = async (id: string) => {
        try {
            await deleteCoupon(id);
            toast.success('Cupón eliminado');
            loadData();
        } catch (error) {
            toast.error('No se pudo eliminar el cupón');
        } finally {
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleDeleteCoupon = (id: string, code: string) => {
        setDeletingIds(prev => new Set(prev).add(id));
        setConfirmDialog({
            isOpen: true,
            title: '¿Eliminar cupón?',
            description: `¿Estás seguro de que deseas eliminar el cupón "${code}"? Esta acción no se puede deshacer.`,
            onConfirm: () => confirmDelete(id)
        });
    };

    const clearFilters = () => {
        setSearchRaw('');
        setFilterStatus('ALL');
        setFilterType('ALL');
        setSortKey('createdAt');
        setSortDir('desc');
    };

    const hasActiveFilters = searchRaw !== '' || filterStatus !== 'ALL' || filterType !== 'ALL';

    if (loading && coupons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Cargando métricas de marketing...</p>
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="text-muted-foreground text-center">{error}</p>
                <Button onClick={loadData} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className=" animate-fade-in text-foreground pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Marketing</h1>
                    <p className="text-muted-foreground text-sm">Rendimiento de cupones y campañas</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingCoupon(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs"
                >
                    <PlusCircle className="w-4 h-4" />
                    Crear Cupón
                </Button>
            </div>

            <TriggersConfigCard />

            {/* Search and filter bar */}
            {coupons.length > 0 && (
                <div className="flex flex-wrap gap-3 items-center mb-6">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar cupón..."
                            value={searchRaw}
                            onChange={e => setSearchRaw(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                        className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none cursor-pointer">
                        <option value="ALL">Todos los estados</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                        <option value="EXPIRADO">Expirado</option>
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)}
                        className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none cursor-pointer">
                        <option value="ALL">Todos los tipos</option>
                        <option value="PERCENTAGE">Porcentaje</option>
                        <option value="FIXED_AMOUNT">Monto fijo</option>
                    </select>
                    <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}
                        className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none cursor-pointer">
                        <option value="createdAt">Más reciente</option>
                        <option value="code">Código</option>
                        <option value="usedCount">Más usado</option>
                        <option value="roi">Mayor ROI</option>
                        <option value="revenue">Mayor ingreso</option>
                    </select>
                    <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                        className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                        title={sortDir === 'asc' ? 'Ascendente' : 'Descendente'}>
                        {sortDir === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading && !error && coupons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 col-span-full">
                    <div className="p-4 rounded-full bg-muted">
                      <Tag className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">Sin cupones todavía</p>
                      <p className="text-muted-foreground text-sm">Crea tu primer cupón para empezar a medir resultados.</p>
                    </div>
                    <Button onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }} className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Crear primer cupón
                    </Button>
                  </div>
                ) : filteredSorted.length === 0 && hasActiveFilters ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 col-span-full">
                        <div className="p-4 rounded-full bg-muted">
                            <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-lg">No hay cupones que coincidan</p>
                            <p className="text-muted-foreground text-sm">Intenta con otros filtros o limpia la búsqueda.</p>
                        </div>
                        <Button onClick={clearFilters} variant="outline" className="gap-2">
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                <>
                {paginated.map(coupon => {
                    const stats = coupon._stats;
                    const status = coupon._status;
                    const isDeleting = deletingIds.has(coupon.id);

                    return (
                        <div
                            key={coupon.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`Editar cupón ${coupon.code}`}
                            onClick={(e) => {
                                if (window.getSelection()?.toString().length === 0) {
                                    setEditingCoupon(coupon);
                                    setIsModalOpen(true);
                                }
                            }}
                            onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && window.getSelection()?.toString().length === 0) {
                                    e.preventDefault();
                                    setEditingCoupon(coupon);
                                    setIsModalOpen(true);
                                }
                            }}
                            className={`bg-card group hover:shadow-md transition-all cursor-pointer rounded-xl overflow-hidden relative border border-border ${status === 'ACTIVO' ? 'shadow-sm' : 'opacity-80'}`}
                        >
                            <div className="p-6 bg-card">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-display font-bold text-2xl tracking-tighter text-foreground leading-none">{coupon.code}</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                            {coupon.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${status === 'ACTIVO' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                        status === 'EXPIRADO' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                                            'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                        }`}>
                                        {status}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <p className="text-4xl font-black tracking-tighter text-foreground">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                        <span className="text-sm font-medium text-muted-foreground ml-1 tracking-normal">OFF</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">ROI</span>
                                        </div>
                                        <p className="text-xl font-black text-primary font-mono">
                                            {stats.roi === null ? '—' : `${stats.roi.toFixed(1)}x`}
                                        </p>
                                    </div>
                                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                            <DollarSign className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Ingresos</span>
                                        </div>
                                        <p className="text-xs font-black text-foreground font-mono">{formatPrice(stats.revenue)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-[11px]">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span className="font-bold flex items-center gap-1"><Users className="w-3 h-3" /> Usos</span>
                                        <span className="text-foreground font-black">{coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}</span>
                                    </div>
                                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full transition-all duration-500"
                                            style={{ width: `${coupon.maxUses ? Math.min((coupon.usedCount / coupon.maxUses) * 100, 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground pt-1">
                                        <span>Expira</span>
                                        <span className="font-bold">{coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('es-CL') : 'Nunca'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 border-t border-border p-4 flex justify-between items-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">ID: {coupon.id.slice(0, 8)}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCoupon(coupon.id, coupon.code);
                                        }}
                                        disabled={isDeleting}
                                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Eliminar cupón"
                                        aria-label={`Eliminar cupón ${coupon.code}`}
                                    >
                                        {isDeleting
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Trash2 className="w-4 h-4" />
                                        }
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCoupon(coupon);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                                        title="Ver detalles"
                                        aria-label={`Ver detalles de cupón ${coupon.code}`}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* "Add coupon" card only on last page or when no pages */}
                {coupons.length > 0 && (totalPages <= 1 || page === totalPages) && (
                <button
                    onClick={() => {
                        setEditingCoupon(null);
                        setIsModalOpen(true);
                    }}
                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all group bg-card/50 min-h-[300px]"
                >
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground group-hover:border-primary flex items-center justify-center mb-4 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Nuevo Cupón</span>
                </button>
                )}
                </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground font-medium">Página {page} de {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="p-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCoupon}
                initialData={editingCoupon}
                automationType={
                    editingCoupon && config
                        ? (config.welcomeCouponCode && editingCoupon.code.toUpperCase() === config.welcomeCouponCode.toUpperCase())
                            ? 'WELCOME'
                            : (config.vipCouponCode && editingCoupon.code.toUpperCase() === config.vipCouponCode.toUpperCase())
                                ? 'VIP'
                                : null
                        : null
                }
                vipConfig={config ? {
                    threshold: config.vipThreshold,
                    message: config.vipRewardMessage
                } : undefined}
            />

            <SonnerConfirm
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
