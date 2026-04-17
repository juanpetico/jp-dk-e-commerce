import Link from 'next/link';
import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { generateOrderPDF } from '@/services/orderReportService';
import { OrdersPageTableProps } from './OrdersPage.types';
import {
    formatOrderPrice,
    getOrderItemsCount,
    getOrderStatusIcon,
    translateOrderStatus,
} from './OrdersPage.utils';

export default function OrdersPageTable({ orders }: OrdersPageTableProps) {
    return (
        <div className="bg-card rounded-md border border-gray-300 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className="w-[300px] text-xs font-bold uppercase tracking-wider pl-6">Pedido</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">Estado</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">Fecha</TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Total</TableHead>
                        <TableHead className="text-center text-xs font-bold uppercase tracking-wider pr-6">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => {
                        const firstItem = order.items[0];

                        return (
                            <TableRow key={order.id} className="hover:bg-muted/50 transition-colors group">
                                <TableCell className="pl-6 font-medium">
                                    <div className="flex items-center gap-4">
                                        {firstItem && (
                                            <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                                <img
                                                    src={firstItem.product.images[0]?.url}
                                                    alt={firstItem.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-bold text-sm text-foreground block truncate max-w-[200px]">
                                                {firstItem?.product.name || `Pedido #${order.id.slice(0, 8)}`}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                ID: #{order.id.slice(0, 8)} | Cantidad: {getOrderItemsCount(order)}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getOrderStatusIcon(order.status)}
                                        <span className="text-sm text-foreground">{translateOrderStatus(order.status)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">{order.date}</TableCell>
                                <TableCell className="text-right font-bold text-foreground">{formatOrderPrice(order.total)}</TableCell>
                                <TableCell className="text-center pr-6">
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:text-[var(--color-amber-900)]"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                generateOrderPDF(order);
                                            }}
                                        >
                                            <Download className="w-4 h-4" />
                                            <span className="sr-only">Descargar boleta</span>
                                        </Button>
                                        <Link href={`/orders/${order.id}`}>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <Eye className="w-4 h-4" />
                                                <span className="sr-only">Ver pedido</span>
                                            </Button>
                                        </Link>
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
