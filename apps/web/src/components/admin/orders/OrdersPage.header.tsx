import React from 'react';
import ExportMenu from '@/components/admin/shared/ExportMenu';

interface OrdersPageHeaderProps {
    ordersCount: number;
    currentExportCount: number;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportPdfAll?: () => void;
    onExportExcelAll?: () => void;
    showAllExportOptions?: boolean;
}

export default function OrdersPageHeader({
    ordersCount,
    currentExportCount,
    onExportPdf,
    onExportExcel,
    onExportPdfAll,
    onExportExcelAll,
    showAllExportOptions,
}: OrdersPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
                        Pedidos
                    </h1>
                    <span className="text-sm font-bold text-muted-foreground">
                        {ordersCount} {ordersCount === 1 ? 'pedido' : 'pedidos'}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">Gestiona y procesa las ordenes de compra</p>
            </div>

            <ExportMenu
                disabled={ordersCount === 0}
                currentCount={currentExportCount}
                totalCount={ordersCount}
                onExportPdf={onExportPdf}
                onExportExcel={onExportExcel}
                onExportPdfAll={onExportPdfAll}
                onExportExcelAll={onExportExcelAll}
                showAllOptions={showAllExportOptions}
            />
        </div>
    );
}
