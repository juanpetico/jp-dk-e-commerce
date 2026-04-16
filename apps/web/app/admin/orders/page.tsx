'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    fetchAllOrders,
    updateOrderStatus,
    ORDER_STATUS_LABELS
} from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import OrderStatusSelect from '@/components/admin/orders/OrderStatusSelect';
import TablePagination from '@/components/admin/shared/TablePagination';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type OrderFiltersState = {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
};

const OrderTableSkeleton = () => (
    <div className="bg-card rounded shadow-sm border border-border dark:border-none overflow-hidden relative">
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="bg-background p-4 rounded-full shadow-xl border border-border">
                <Loader2 className="w-6 h-6 animate-spin text-foreground" />
            </div>
        </div>
        <div className="animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="h-2 w-12 bg-muted rounded"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row}>
                                <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-8 bg-muted rounded mx-auto"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-6 w-24 bg-muted rounded-full"></div></td>
                                <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-muted rounded-lg ml-auto"></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para filtros
    const [filters, setFilters] = useState<OrderFiltersState>({});

    const loadOrders = useCallback(async (currentFilters = filters) => {
        try {
            setLoading(true);
            const { search, ...serverFilters } = currentFilters;
            const data = await fetchAllOrders(serverFilters);

            const normalizedSearch = search?.trim().toLowerCase();
            const filteredData = normalizedSearch
                ? data.filter((order) => {
                    const customerName = (order.customerName || order.user?.name || '').toLowerCase();
                    const customerEmail = (order.customerEmail || order.user?.email || '').toLowerCase();
                    return customerName.includes(normalizedSearch) || customerEmail.includes(normalizedSearch);
                })
                : data;

            setOrders(filteredData);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Error al cargar las órdenes');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleFilterChange = (newFilters: OrderFiltersState) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filtering
        // loadOrders se ejecutará automáticamente por el useEffect
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders(prevOrders => prevOrders ? prevOrders.map(o => o.id === orderId ? updatedOrder : o) : null);

            // Si el modal está abierto y es la misma orden, actualizarla
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(updatedOrder);
            }

            toast.success(`Orden ${orderId.slice(0, 8)} actualizada a ${ORDER_STATUS_LABELS[newStatus]}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error al actualizar el estado de la orden');
            // Recargar órdenes para asegurar consistencia
            loadOrders();
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(price);
    };

    const handleExportCSV = () => {
        if (!orders || orders.length === 0) {
            toast.error('No hay pedidos para exportar');
            return;
        }

        // Preparar cabeceras
        const headers = ['ID', 'Fecha', 'Cliente', 'Email', 'Items', 'Total', 'Estado'];

        // Preparar datos
        const csvData = orders.map(order => [
            `#${order.id.slice(0, 8)}`,
            new Date(order.createdAt).toLocaleString('es-CL'),
            order.user?.name || 'Invitado',
            order.user?.email || 'N/A',
            order.items.reduce((acc, item) => acc + item.quantity, 0),
            order.total,
            ORDER_STATUS_LABELS[order.status]
        ]);

        // Unir todo - Usar punto y coma para mejor compatibilidad con Excel en regiones latinas
        const csvString = [
            headers.join(';'),
            ...csvData.map(row => row.join(';'))
        ].join('\n');

        // Crear blob con BOM para que Excel detecte UTF-8 correctamente
        const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Archivo CSV generado con éxito');
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

    // Calculate paginated orders
    const totalItems = orders?.length || 0;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = orders?.slice(startIndex, startIndex + itemsPerPage) || [];

    // Reset to first page when itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Pedidos</h1>
                        {orders !== null && <span className="text-sm font-bold text-muted-foreground">{orders?.length || 0} {(orders?.length || 0) === 1 ? 'pedido' : 'pedidos'}</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">Gestiona y procesa las órdenes de compra</p>
                </div>
                <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                </Button>
            </div>

            <OrderFilters
                onFilterChange={handleFilterChange}
                activeFiltersCount={activeFiltersCount}
            />

            {(!isMounted || orders === null) ? (
                <OrderTableSkeleton />
            ) : orders.length === 0 ? (
                <div className="bg-card rounded shadow-sm border border-border p-24 text-center">
                    <TableEmptyState
                        title={activeFiltersCount > 0 ? 'No hay pedidos que coincidan' : 'Sin pedidos todavía'}
                        description={activeFiltersCount > 0
                            ? 'Intenta con otros filtros o limpia la búsqueda.'
                            : 'Cuando entren pedidos, aparecerán en esta tabla.'}
                        actionLabel={activeFiltersCount > 0 ? 'Limpiar filtros' : undefined}
                        onAction={activeFiltersCount > 0 ? () => handleFilterChange({}) : undefined}
                    />
                </div>
            ) : (
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded">
                            <div className="bg-background p-4 rounded-full shadow-xl border border-border">
                                <Loader2 className="w-6 h-6 animate-spin text-foreground" />
                            </div>
                        </div>
                    )}
                    <div className="bg-card rounded shadow-sm border border-border dark:border-none overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Cliente</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Fecha</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Productos</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Total</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Estado</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedOrders.map((order) => (
                                    <TableRow key={order.id} className="group hover:bg-muted/50 transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground uppercase tracking-tight">
                                                    {order.customerName || order.user?.name || 'Invitado'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {order.customerEmail || order.user?.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">
                                                    {new Date(order.date || order.createdAt).toLocaleDateString('es-CL', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground uppercase font-black">
                                                    {new Date(order.date || order.createdAt).toLocaleTimeString('es-CL', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-xs font-bold text-foreground">
                                                    {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-black text-foreground font-mono">
                                                {formatPrice(order.total)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusSelect
                                                orderId={order.id}
                                                currentStatus={order.status}
                                                onStatusChange={handleStatusChange}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
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
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
