import { ORDER_STATUS_LABELS } from '@/services/orderService';
import { exportRowsToPdf } from '@/services/exportPdfService';
import { Order } from '@/types';

export const exportOrdersPdf = (orders: Order[]) => {
    const rows = orders.map((order) => ({
        ID: `#${order.id.slice(0, 8)}`,
        Fecha: new Date(order.createdAt).toLocaleString('es-CL'),
        Cliente: order.user?.name || order.customerName || 'Invitado',
        Email: order.user?.email || order.customerEmail || 'N/A',
        Items: order.items.reduce((acc, item) => acc + item.quantity, 0),
        Total: order.total,
        Estado: ORDER_STATUS_LABELS[order.status],
    }));

    exportRowsToPdf(rows, {
        fileNameBase: 'pedidos',
        title: 'REPORTE DE PEDIDOS',
    });
};
