import React from 'react';
import { ExternalLink, Package, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS, getOrderStatusColor } from '@/services/orderService';
import { formatCLP, formatDate } from '../formatters';
import { OrdersSectionProps } from '../types';
import { EmptyState } from '../components/EmptyState';

export function OrdersSection({ orders, onSelectOrder }: OrdersSectionProps) {
    if (orders.length === 0) {
        return (
            <EmptyState
                icon={<ShoppingBag className="h-8 w-8" />}
                title="Sin pedidos"
                description="Este cliente aun no ha realizado ningun pedido."
            />
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {orders.map((order) => (
                <button
                    key={order.id}
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-muted/40"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="font-mono text-xs font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</p>
                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(order.date ?? order.createdAt)}</p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        <span
                            className={cn(
                                'rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                                getOrderStatusColor(order.status)
                            )}
                        >
                            {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <span className="whitespace-nowrap font-mono text-sm font-bold text-foreground">{formatCLP(order.total)}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}
