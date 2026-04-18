import Link from 'next/link';
import { Eye } from 'lucide-react';
import { ORDER_STATUS_LABELS, getOrderStatusColor } from '@/services/orderService';
import TablePagination from '@/components/admin/shared/TablePagination';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

interface DashboardRecentOrdersTableProps {
    basePath: '/admin' | '/superadmin';
    orders: Order[];
    paginatedOrders: Order[];
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
    onViewOrder: (order: Order) => void;
}

export function DashboardRecentOrdersTable({
    basePath,
    orders,
    paginatedOrders,
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    onViewOrder,
}: DashboardRecentOrdersTableProps) {
    return (
        <div className="bg-card dark:bg-card rounded-xl border border-gray-300 dark:border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-300 dark:border-border flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">Pedidos Recientes</h3>
                <Link href={`${basePath}/orders`} className="text-xs text-muted-foreground hover:text-foreground underline">
                    Ver todos
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 dark:bg-muted/20">
                        <tr>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID Orden</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-border/50">
                        {paginatedOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-foreground">{order.customerName || order.user?.name || 'Invitado'}</div>
                                    <div className="text-[10px] text-muted-foreground">{order.customerEmail || order.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</td>
                                <td className="px-6 py-4 text-xs font-mono text-foreground">{formatPrice(order.total)}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-sm border shadow-sm ${getOrderStatusColor(order.status)}`}>
                                        {ORDER_STATUS_LABELS[order.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onViewOrder(order)}
                                        className="inline-flex items-center gap-2 bg-background border border-border px-2.5 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-muted transition-all text-foreground shadow-sm"
                                    >
                                        Ver <Eye className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                    No hay pedidos recientes
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
            />
        </div>
    );
}
