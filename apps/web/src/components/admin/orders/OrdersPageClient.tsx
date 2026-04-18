'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    fetchAllOrders,
    ORDER_STATUS_LABELS,
    updateOrderStatus,
} from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import TablePagination from '@/components/admin/shared/TablePagination';
import OrderDetailModal from './OrderDetailModal';
import OrderFilters from './OrderFilters';
import { exportOrdersExcel } from './OrdersPage.csv';
import OrdersPageHeader from './OrdersPage.header';
import OrdersPageSkeleton from './OrdersPage.skeleton';
import OrdersPageTable from './OrdersPage.table';
import { OrderFiltersState } from './OrdersPage.types';

export default function OrdersPageClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState<OrderFiltersState>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const loadOrders = useCallback(
        async (currentFilters = filters) => {
            try {
                setLoading(true);
                const { search, ...serverFilters } = currentFilters;
                const data = await fetchAllOrders(serverFilters);

                const normalizedSearch = search?.trim().toLowerCase();
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
            } catch (error) {
                console.error('Error loading orders:', error);
                toast.error('Error al cargar las ordenes');
            } finally {
                setLoading(false);
            }
        },
        [filters]
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

    const handleFilterChange = (newFilters: OrderFiltersState) => {
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

    const handleExportExcel = () => {
        if (!orders || orders.length === 0) {
            toast.error('No hay pedidos para exportar');
            return;
        }

        exportOrdersExcel(orders);
        toast.success('Archivo Excel generado con exito');
    };

    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter((value) => value !== undefined && value !== '').length;
    }, [filters]);

    const totalItems = orders?.length || 0;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = orders?.slice(startIndex, startIndex + itemsPerPage) || [];

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <OrdersPageHeader ordersCount={orders?.length || 0} onExport={handleExportExcel} />

            <OrderFilters onFilterChange={handleFilterChange} activeFiltersCount={activeFiltersCount} />

            {!isMounted || orders === null ? (
                <OrdersPageSkeleton />
            ) : orders.length === 0 ? (
                <div className="rounded border border-border bg-card p-24 text-center shadow-sm">
                    <TableEmptyState
                        title={activeFiltersCount > 0 ? 'No hay pedidos que coincidan' : 'Sin pedidos todavia'}
                        description={
                            activeFiltersCount > 0
                                ? 'Intenta con otros filtros o limpia la busqueda.'
                                : 'Cuando entren pedidos, apareceran en esta tabla.'
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
