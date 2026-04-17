import React from 'react';
import { Eye } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Order, OrderStatus } from '@/types';
import OrderStatusSelect from './OrderStatusSelect';
import { formatOrderDate, formatOrderTime, formatOrderTotal, getOrderItemsCount } from './OrdersPage.utils';

interface OrdersPageTableProps {
    orders: Order[];
    onViewOrder: (order: Order) => void;
    onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export default function OrdersPageTable({ orders, onViewOrder, onStatusChange }: OrdersPageTableProps) {
    return (
        <div className="overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-100 hover:bg-transparent dark:border-gray-800">
                        <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest">ID</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Cliente</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Fecha</TableHead>
                        <TableHead className="text-center text-[10px] font-black uppercase tracking-widest">Productos</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Total</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Estado</TableHead>
                        <TableHead className="pr-6 text-right text-[10px] font-black uppercase tracking-widest">Acciones</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {orders.map((order) => {
                        const orderDateValue = order.date || order.createdAt;
                        return (
                            <TableRow key={order.id} className="group transition-colors hover:bg-muted/50">
                                <TableCell className="pl-6">
                                    <span className="font-mono text-xs font-bold text-foreground">
                                        #{order.id.slice(-8).toUpperCase()}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold uppercase tracking-tight text-foreground">
                                            {order.customerName || order.user?.name || 'Invitado'}
                                        </span>
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            {order.customerEmail || order.user?.email}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-foreground">
                                            {formatOrderDate(orderDateValue)}
                                        </span>
                                        <span className="text-[9px] font-black uppercase text-muted-foreground">
                                            {formatOrderTime(orderDateValue)}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell className="text-center">
                                    <span className="text-xs font-bold text-foreground">
                                        {getOrderItemsCount(order.items)}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span className="font-mono text-sm font-black text-foreground">
                                        {formatOrderTotal(order.total)}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <OrderStatusSelect
                                        orderId={order.id}
                                        currentStatus={order.status}
                                        onStatusChange={onStatusChange}
                                    />
                                </TableCell>

                                <TableCell className="pr-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onViewOrder(order)}
                                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            title="Ver detalles"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
