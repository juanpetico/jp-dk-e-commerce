'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, Loader2, PackageCheck } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    fetchAllOrders,
    ORDER_STATUS_LABELS,
    updateOrderStatus,
} from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import AdminDataLoadErrorState from '@/components/admin/shared/AdminDataLoadErrorState';
import TablePagination from '@/components/admin/shared/TablePagination';
import OrderDetailModal from './OrderDetailModal';
import OrderFilters from './OrderFilters';
import { exportOrdersExcel } from './OrdersPage.csv';
import { exportOrdersPdf } from './OrdersPage.pdf';
import OrdersPageHeader from './OrdersPage.header';
import OrdersPageSkeleton from './OrdersPage.skeleton';
import OrdersPageTable from './OrdersPage.table';
import { OrderFiltersState } from './OrdersPage.types';

type OrderOperationsTabId = 'TODOS' | 'REQUIEREN_ATENCION' | 'POR_PREPARAR' | 'HISTORIAL';

const ORDER_OPERATIONS_TABS: {
    id: OrderOperationsTabId;
    label: string;
    statuses: OrderStatus[];
    icon: React.ComponentType<{ className?: string }>;
    activeClasses: string;
    countClasses: string;
    emptyTitle: string;
    emptyDescription: string;
}[] = [
    {
        id: 'TODOS',
        label: 'Todos',
        statuses: ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'],
        icon: ClipboardList,
        activeClasses:
            'border-gray-300 bg-muted text-foreground dark:border-border dark:bg-muted/60 dark:text-foreground',
        countClasses: 'bg-foreground/10 text-foreground dark:bg-foreground/20 dark:text-foreground',
        emptyTitle: 'Sin pedidos todavia',
        emptyDescription: 'Cuando entren pedidos, apareceran en esta tabla.',
    },
    {
        id: 'REQUIEREN_ATENCION',
        label: 'Requieren atencion',
        statuses: ['PENDING'],
        icon: AlertCircle,
        activeClasses:
            'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/30 dark:text-amber-400',
        countClasses:
            'bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
        emptyTitle: 'No hay pedidos pendientes',
        emptyDescription: 'Los pedidos que requieren atencion apareceran aqui.',
    },
    {
        id: 'POR_PREPARAR',
        label: 'Por preparar',
        statuses: ['CONFIRMED'],
        icon: PackageCheck,
        activeClasses:
            'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-400',
        countClasses: 'bg-blue-200 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
        emptyTitle: 'No hay pedidos por preparar',
        emptyDescription: 'Cuando confirmes pedidos, se mostraran en esta vista.',
    },
    {
        id: 'HISTORIAL',
        label: 'Completados / Cancelados',
        statuses: ['DELIVERED', 'CANCELLED'],
        icon: CheckCircle2,
        activeClasses:
            'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-400',
        countClasses:
            'bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
        emptyTitle: 'No hay pedidos completados o cancelados',
        emptyDescription: 'El historico aparecera aqui a medida que cierres pedidos.',
    },
];

const DEFAULT_ORDER_OPERATIONS_TAB = ORDER_OPERATIONS_TABS[0]!;

const getOrderOperationsTabById = (
    tabId: OrderOperationsTabId
): (typeof ORDER_OPERATIONS_TABS)[number] => {
    return ORDER_OPERATIONS_TABS.find((tab) => tab.id === tabId) || DEFAULT_ORDER_OPERATIONS_TAB;
};

export default function OrdersPageClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState<OrderFiltersState>({});
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [activeTab, setActiveTab] = useState<OrderOperationsTabId>('TODOS');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const loadOrders = useCallback(
        async (currentFilters = filters) => {
            try {
                setLoading(true);
                setError(null);
                const { search, ...serverFilters } = currentFilters;
                const data = await fetchAllOrders(serverFilters);

                const normalizedSearch = searchInput.trim().toLowerCase();
                const filteredData = normalizedSearch
                    ? data.filter((order) => {
                          const customerName = (order.customerName || order.user?.name || '').toLowerCase();
                          const customerEmail = (order.customerEmail || order.user?.email || '').toLowerCase();
                          const orderId = order.id.toLowerCase();
                          return (
                              customerName.includes(normalizedSearch) ||
                              customerEmail.includes(normalizedSearch) ||
                              orderId.includes(normalizedSearch)
                          );
                      })
                    : data;

                setOrders(filteredData);
            } catch (requestError) {
                console.error('Error loading orders:', requestError);
                setError('Error al cargar las ordenes');
            } finally {
                setLoading(false);
            }
        },
        [filters, searchInput]
    );

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (!orderId || !orders) return;
        const found = orders.find((order) => order.id === orderId);
        if (!found) return;

        setSelectedOrder(found);
        setIsModalOpen(true);
    }, [orders, searchParams]);

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const handleFilterChange = (newFilters: OrderFiltersState) => {
        setSearchInput(newFilters.search?.trim() || '');
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders((prev) => (prev ? prev.map((order) => (order.id === orderId ? updatedOrder : order)) : null));

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(updatedOrder);
            }

            toast.success(`Orden ${orderId.slice(0, 8)} actualizada a ${ORDER_STATUS_LABELS[newStatus]}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error al actualizar el estado de la orden');
            loadOrders();
        }
    };

    const getCurrentScopeOrders = () => {
        if (scopedOrders.length === 0) {
            toast.error('No hay pedidos para exportar');
            return null;
        }

        const hasFilters = Object.values(filters).some((value) => value !== undefined && value !== '');
        if (hasFilters) {
            return scopedOrders;
        }

        return paginatedOrders;
    };

    const getCurrentScopeLabel = () => {
        const hasFilters = Object.values(filters).some((value) => value !== undefined && value !== '');
        return hasFilters ? 'filtros actuales' : 'pagina actual';
    };

    const getAllOrders = () => {
        if (scopedOrders.length === 0) {
            toast.error('No hay pedidos para exportar');
            return null;
        }

        return scopedOrders;
    };

    const handleExportExcel = () => {
        const exportOrders = getCurrentScopeOrders();
        if (!exportOrders) return;

        exportOrdersExcel(exportOrders);
        toast.success(`Archivo Excel generado (${exportOrders.length} registros, ${getCurrentScopeLabel()})`);
    };

    const handleExportPdf = () => {
        const exportOrders = getCurrentScopeOrders();
        if (!exportOrders) return;

        exportOrdersPdf(exportOrders);
        toast.success(`Reporte PDF generado (${exportOrders.length} registros, ${getCurrentScopeLabel()})`);
    };

    const handleExportExcelAll = () => {
        const exportOrders = getAllOrders();
        if (!exportOrders) return;

        exportOrdersExcel(exportOrders);
        toast.success(`Archivo Excel generado (${exportOrders.length} registros, todos)`);
    };

    const handleExportPdfAll = () => {
        const exportOrders = getAllOrders();
        if (!exportOrders) return;

        exportOrdersPdf(exportOrders);
        toast.success(`Reporte PDF generado (${exportOrders.length} registros, todos)`);
    };

    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter((value) => value !== undefined && value !== '').length;
    }, [filters]);

    const activeTabConfig = useMemo(() => getOrderOperationsTabById(activeTab), [activeTab]);

    const scopedOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter((order) => activeTabConfig.statuses.includes(order.status));
    }, [orders, activeTabConfig]);

    const totalItems = scopedOrders.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = scopedOrders.slice(startIndex, startIndex + itemsPerPage);
    const hasFilters = Object.values(filters).some((value) => value !== undefined && value !== '');

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <OrdersPageHeader
                ordersCount={scopedOrders.length}
                currentExportCount={hasFilters ? scopedOrders.length : paginatedOrders.length}
                onExportPdf={handleExportPdf}
                onExportExcel={handleExportExcel}
                onExportPdfAll={handleExportPdfAll}
                onExportExcelAll={handleExportExcelAll}
                showAllExportOptions={!hasFilters && scopedOrders.length > paginatedOrders.length}
            />

            <div className="overflow-x-auto rounded border border-gray-300 dark:border-border bg-card p-2 shadow-sm">
                <div className="flex min-w-max gap-2">
                    {ORDER_OPERATIONS_TABS.map((tab) => {
                        const isActive = tab.id === activeTab;
                        const tabCount = orders?.filter((order) => tab.statuses.includes(order.status)).length || 0;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-md border border-gray-300 dark:border-border px-3 py-2 text-left transition-colors ${
                                    isActive
                                        ? tab.activeClasses
                                        : 'bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-black uppercase tracking-wide">{tab.label}</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                        isActive ? tab.countClasses : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {tabCount}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <OrderFilters onFilterChange={handleFilterChange} activeFiltersCount={activeFiltersCount} />

            {!isMounted || orders === null ? (
                <OrdersPageSkeleton />
            ) : error ? (
                <div className="rounded border border-border bg-card shadow-sm">
                    <AdminDataLoadErrorState message={error} onRetry={loadOrders} />
                </div>
            ) : scopedOrders.length === 0 ? (
                <div className="rounded border border-border bg-card p-24 text-center shadow-sm">
                    <TableEmptyState
                        title={
                            activeFiltersCount > 0 ? 'No hay pedidos que coincidan' : activeTabConfig.emptyTitle
                        }
                        description={
                            activeFiltersCount > 0
                                ? 'Intenta con otros filtros o limpia la busqueda.'
                                : activeTabConfig.emptyDescription
                        }
                        actionLabel={activeFiltersCount > 0 ? 'Limpiar filtros' : undefined}
                        onAction={activeFiltersCount > 0 ? () => handleFilterChange({}) : undefined}
                    />
                </div>
            ) : (
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-background/40 backdrop-blur-[1px]">
                            <div className="rounded-full border border-border bg-background p-4 shadow-xl">
                                <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                            </div>
                        </div>
                    )}

                    <OrdersPageTable
                        orders={paginatedOrders}
                        onViewOrder={(order) => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                        }}
                        onStatusChange={handleStatusChange}
                    />

                    <TablePagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            )}

            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    if (searchParams.get('orderId')) {
                        router.replace(pathname);
                    }
                }}
                order={selectedOrder}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
