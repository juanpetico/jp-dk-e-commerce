'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AdminDataLoadErrorState from '@/components/admin/shared/AdminDataLoadErrorState';
import SonnerConfirm from '@/components/ui/SonnerConfirm';
import CouponModal from '@/components/admin/coupon';
import TriggersConfigCard from '@/components/admin/marketing/TriggersConfigCard';
import MarketingPageCouponsGrid from './MarketingPage.coupons-grid';
import MarketingPageFilters from './MarketingPage.filters';
import MarketingPageHeader from './MarketingPage.header';
import MarketingPagePagination from './MarketingPage.pagination';
import MarketingPageStats from './MarketingPage.stats';
import { PAGE_SIZE, formatMarketingPrice } from './MarketingPage.utils';
import { EnrichedCoupon, MarketingSortDir, MarketingSortKey, MarketingStatusFilter, MarketingTypeFilter } from './MarketingPage.types';
import { Coupon, Order } from '@/types';
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/couponService';
import { fetchAllOrders } from '@/services/orderService';
import { exportRowsToExcel } from '@/services/exportExcelService';
import { exportRowsToPdf } from '@/services/exportPdfService';
import { getCouponStatus, getCouponStats } from '@/lib/coupon-utils';
import { shopConfigService, StoreConfig } from '@/services/shopConfigService';
import { toast } from 'sonner';

export default function MarketingPageClient() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [config, setConfig] = useState<StoreConfig | null>(null);

    const [searchRaw, setSearchRaw] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<MarketingStatusFilter>('ALL');
    const [filterType, setFilterType] = useState<MarketingTypeFilter>('ALL');
    const [sortKey, setSortKey] = useState<MarketingSortKey>('createdAt');
    const [sortDir, setSortDir] = useState<MarketingSortDir>('desc');
    const [page, setPage] = useState(1);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        const timeout = setTimeout(() => setSearchQuery(searchRaw), 300);
        return () => clearTimeout(timeout);
    }, [searchRaw]);

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
                shopConfigService.getConfig(),
            ]);

            setCoupons(couponsData);
            setOrders(ordersData);
            setConfig(configData);
        } catch (requestError) {
            setError('Error al cargar datos de marketing');
            console.error(requestError);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const enrichedCoupons = useMemo<EnrichedCoupon[]>(
        () =>
            coupons.map((coupon) => ({
                ...coupon,
                _status: getCouponStatus(coupon),
                _stats: getCouponStats(coupon.id, orders),
            })),
        [coupons, orders]
    );

    const filteredSorted = useMemo(() => {
        let result = enrichedCoupons;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (coupon) =>
                    coupon.code.toLowerCase().includes(query) ||
                    (coupon.description ?? '').toLowerCase().includes(query)
            );
        }

        if (filterStatus !== 'ALL') result = result.filter((coupon) => coupon._status === filterStatus);
        if (filterType !== 'ALL') result = result.filter((coupon) => coupon.type === filterType);

        return [...result].sort((a, b) => {
            const getVal = (coupon: EnrichedCoupon) => {
                if (sortKey === 'code') return coupon.code;
                if (sortKey === 'usedCount') return coupon.usedCount;
                if (sortKey === 'roi') return coupon._stats.roi ?? -Infinity;
                if (sortKey === 'revenue') return coupon._stats.revenue;
                return coupon.id;
            };

            const valA = getVal(a);
            const valB = getVal(b);
            return (valA < valB ? -1 : valA > valB ? 1 : 0) * (sortDir === 'asc' ? 1 : -1);
        });
    }, [enrichedCoupons, searchQuery, filterStatus, filterType, sortKey, sortDir]);

    const paginatedCoupons = useMemo(
        () => filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [filteredSorted, page]
    );

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
                    const isWelcome =
                        config.welcomeCouponCode &&
                        editingCoupon.code.toUpperCase() === config.welcomeCouponCode.toUpperCase();
                    const isVIP =
                        config.vipCouponCode && editingCoupon.code.toUpperCase() === config.vipCouponCode.toUpperCase();

                    if (isWelcome || isVIP) {
                        try {
                            if (isWelcome) {
                                await shopConfigService.updateConfig({
                                    welcomeCouponCode: cleanCouponData.code?.toUpperCase(),
                                    welcomeCouponType: cleanCouponData.type,
                                    welcomeCouponValue: cleanCouponData.value,
                                });
                                toast.info('Configuración de bienvenida actualizada');
                            } else if (isVIP) {
                                await shopConfigService.updateConfig({
                                    vipCouponCode: cleanCouponData.code?.toUpperCase(),
                                    vipCouponType: cleanCouponData.type,
                                    vipCouponValue: cleanCouponData.value,
                                    vipThreshold,
                                    vipRewardMessage,
                                });
                                toast.info('Configuración VIP actualizada');
                            }
                        } catch {
                            try {
                                await updateCoupon(editingCoupon.id, originalSnapshot);
                                toast.error(
                                    'Error al sincronizar configuración. Los cambios en el cupón fueron revertidos.'
                                );
                            } catch {
                                toast.error(
                                    'Error crítico: no se pudo revertir el cupón. Recarga la página y verifica manualmente.',
                                    { duration: 10000 }
                                );
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
        } catch {
            toast.error('Error al procesar el cupón');
        }
    };

    const confirmDelete = async (id: string) => {
        try {
            await deleteCoupon(id);
            toast.success('Cupón eliminado');
            loadData();
        } catch {
            toast.error('No se pudo eliminar el cupón');
        } finally {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleDeleteCoupon = (id: string, code: string) => {
        setDeletingIds((prev) => new Set(prev).add(id));
        setConfirmDialog({
            isOpen: true,
            title: '¿Eliminar cupón?',
            description: `¿Estás seguro de que deseas eliminar el cupón "${code}"? Esta acción no se puede deshacer.`,
            onConfirm: () => confirmDelete(id),
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

    const getExportRows = (source: EnrichedCoupon[]) => {
        if (source.length === 0) {
            toast.error('No hay cupones para exportar');
            return null;
        }

        return source.map((coupon) => ({
            ID: coupon.id,
            Codigo: coupon.code,
            Descripcion: coupon.description || '-',
            Estado: coupon._status,
            Tipo: coupon.type,
            Valor: coupon.value,
            Usos: coupon.usedCount,
            'Limite de Usos': coupon.maxUses ?? 'Sin limite',
            Ingresos: coupon._stats.revenue,
            ROI: coupon._stats.roi === null ? '-' : coupon._stats.roi,
            Inicio: coupon.startDate ? new Date(coupon.startDate).toLocaleString('es-CL') : '-',
            Fin: coupon.endDate ? new Date(coupon.endDate).toLocaleString('es-CL') : 'Nunca',
        }));
    };

    const getCurrentScopeCoupons = () => {
        if (hasActiveFilters) return filteredSorted;
        return paginatedCoupons;
    };

    const getCurrentScopeLabel = () => (hasActiveFilters ? 'filtros actuales' : 'pagina actual');

    const handleExportExcel = () => {
        const rows = getExportRows(getCurrentScopeCoupons());
        if (!rows) return;

        exportRowsToExcel(rows, {
            fileNameBase: 'marketing-cupones',
            sheetName: 'Marketing',
        });
        toast.success(`Archivo Excel generado (${rows.length} registros, ${getCurrentScopeLabel()})`);
    };

    const handleExportPdf = () => {
        const rows = getExportRows(getCurrentScopeCoupons());
        if (!rows) return;

        exportRowsToPdf(rows, {
            fileNameBase: 'marketing-cupones',
            title: 'REPORTE DE MARKETING',
        });
        toast.success(`Reporte PDF generado (${rows.length} registros, ${getCurrentScopeLabel()})`);
    };

    const handleExportExcelAll = () => {
        const rows = getExportRows(filteredSorted);
        if (!rows) return;

        exportRowsToExcel(rows, {
            fileNameBase: 'marketing-cupones',
            sheetName: 'Marketing',
        });
        toast.success(`Archivo Excel generado (${rows.length} registros, todos)`);
    };

    const handleExportPdfAll = () => {
        const rows = getExportRows(filteredSorted);
        if (!rows) return;

        exportRowsToPdf(rows, {
            fileNameBase: 'marketing-cupones',
            title: 'REPORTE DE MARKETING',
        });
        toast.success(`Reporte PDF generado (${rows.length} registros, todos)`);
    };

    if (loading && coupons.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-medium text-muted-foreground">Cargando métricas de marketing...</p>
            </div>
        );
    }

    if (error && !loading) {
        return <AdminDataLoadErrorState message={error} onRetry={loadData} />;
    }

    const totalRevenue = enrichedCoupons.reduce((sum, coupon) => sum + coupon._stats.revenue, 0);
    const activeCoupons = enrichedCoupons.filter((coupon) => coupon._status === 'ACTIVO').length;
    const totalUses = enrichedCoupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);

    return (
        <div className="animate-fade-in space-y-6 pb-20 text-foreground">
            <MarketingPageHeader
                loading={loading}
                visibleCouponsCount={filteredSorted.length}
                currentExportCount={hasActiveFilters ? filteredSorted.length : paginatedCoupons.length}
                onExportPdf={handleExportPdf}
                onExportExcel={handleExportExcel}
                onExportPdfAll={handleExportPdfAll}
                onExportExcelAll={handleExportExcelAll}
                showAllExportOptions={!hasActiveFilters && filteredSorted.length > paginatedCoupons.length}
                onCreateCoupon={() => {
                    setEditingCoupon(null);
                    setIsModalOpen(true);
                }}
            />

            <MarketingPageStats
                activeCoupons={activeCoupons}
                totalCoupons={coupons.length}
                totalUses={totalUses}
                totalRevenueFormatted={formatMarketingPrice(totalRevenue)}
            />

            <TriggersConfigCard />

            <div className="flex items-center gap-3 pt-2">
                <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Cupones
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <MarketingPageFilters
                couponsCount={coupons.length}
                searchRaw={searchRaw}
                filterStatus={filterStatus}
                filterType={filterType}
                sortKey={sortKey}
                sortDir={sortDir}
                hasActiveFilters={hasActiveFilters}
                onSearchRawChange={setSearchRaw}
                onFilterStatusChange={setFilterStatus}
                onFilterTypeChange={setFilterType}
                onSortKeyChange={setSortKey}
                onToggleSortDir={() => setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))}
                onClearFilters={clearFilters}
            />

            <MarketingPageCouponsGrid
                loading={loading}
                error={error}
                couponsCount={coupons.length}
                filteredCount={filteredSorted.length}
                hasActiveFilters={hasActiveFilters}
                paginatedCoupons={paginatedCoupons}
                totalPages={totalPages}
                page={page}
                deletingIds={deletingIds}
                onCreateCoupon={() => {
                    setEditingCoupon(null);
                    setIsModalOpen(true);
                }}
                onClearFilters={clearFilters}
                onEditCoupon={(coupon) => {
                    setEditingCoupon(coupon);
                    setIsModalOpen(true);
                }}
                onDeleteCoupon={handleDeleteCoupon}
                formatPrice={formatMarketingPrice}
            />

            <MarketingPagePagination
                page={page}
                totalPages={totalPages}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
            />

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCoupon}
                initialData={editingCoupon}
                automationType={
                    editingCoupon && config
                        ? config.welcomeCouponCode &&
                          editingCoupon.code.toUpperCase() === config.welcomeCouponCode.toUpperCase()
                            ? 'WELCOME'
                            : config.vipCouponCode &&
                                editingCoupon.code.toUpperCase() === config.vipCouponCode.toUpperCase()
                              ? 'VIP'
                              : null
                        : null
                }
                vipConfig={
                    config
                        ? {
                              threshold: config.vipThreshold,
                              message: config.vipRewardMessage,
                          }
                        : undefined
                }
            />

            <SonnerConfirm
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
