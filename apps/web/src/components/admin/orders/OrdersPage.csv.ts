import { ORDER_STATUS_LABELS } from '@/services/orderService';
import { Order } from '@/types';

export const exportOrdersCsv = (orders: Order[]) => {
    const headers = ['ID', 'Fecha', 'Cliente', 'Email', 'Items', 'Total', 'Estado'];

    const csvRows = orders.map((order) => [
        `#${order.id.slice(0, 8)}`,
        new Date(order.createdAt).toLocaleString('es-CL'),
        order.user?.name || 'Invitado',
        order.user?.email || 'N/A',
        order.items.reduce((acc, item) => acc + item.quantity, 0),
        order.total,
        ORDER_STATUS_LABELS[order.status],
    ]);

    const csvString = [headers.join(';'), ...csvRows.map((row) => row.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
