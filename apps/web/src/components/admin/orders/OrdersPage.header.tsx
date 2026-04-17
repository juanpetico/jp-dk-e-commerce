import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OrdersPageHeaderProps {
    ordersCount: number;
    onExport: () => void;
}

export default function OrdersPageHeader({ ordersCount, onExport }: OrdersPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-3">
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">
                        Pedidos
                    </h1>
                    <span className="text-sm font-bold text-muted-foreground">
                        {ordersCount} {ordersCount === 1 ? 'pedido' : 'pedidos'}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">Gestiona y procesa las ordenes de compra</p>
            </div>

            <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
            </Button>
        </div>
    );
}
