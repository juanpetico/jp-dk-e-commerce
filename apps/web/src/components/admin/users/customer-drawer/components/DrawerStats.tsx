import React from 'react';
import { Order, User } from '@/types';
import { formatCLP } from '../formatters';

interface DrawerStatsProps {
    customer: User;
    orders: Order[];
    activeCouponsCount: number;
}

export function DrawerStats({ customer, orders, activeCouponsCount }: DrawerStatsProps) {
    return (
        <div className="flex shrink-0 items-center divide-x divide-border border-b border-border">
            <div className="flex-1 px-5 py-3 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Pedidos</p>
                <p className="font-display text-lg font-black text-foreground">{orders.length}</p>
            </div>
            <div className="flex-1 px-5 py-3 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total gastado</p>
                <p className="font-display text-lg font-black text-foreground">
                    {formatCLP(customer.totalSpent ?? orders.reduce((sum, order) => sum + order.total, 0))}
                </p>
            </div>
            <div className="flex-1 px-5 py-3 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Cupones</p>
                <p className="font-display text-lg font-black text-foreground">{activeCouponsCount}</p>
            </div>
        </div>
    );
}
