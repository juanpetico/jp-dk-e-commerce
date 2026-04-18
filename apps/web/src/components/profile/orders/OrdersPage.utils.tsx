import { AlertCircle, CheckCircle2, Clock, CreditCard, Package, Truck, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { OrdersDateFilter, OrdersDateRange, OrdersSortBy } from './OrdersPage.types';

const STATUS_TRANSLATIONS: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
    PROCESSING: 'Procesando',
    PAID: 'Pagado',
};

const getOrderDate = (order: Order) => new Date(order.createdAt || order.date);

export const formatOrderPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

export const translateOrderStatus = (status: string) => {
    return STATUS_TRANSLATIONS[status.toUpperCase()] || status;
};

export const getOrderStatusIcon = (status: string) => {
    switch (status.toUpperCase() as OrderStatus | string) {
        case 'PENDING':
            return <Clock className="w-3.5 h-3.5" />;
        case 'CONFIRMED':
            return <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />;
        case 'PROCESSING':
            return <Package className="w-3.5 h-3.5" />;
        case 'PAID':
            return <CreditCard className="w-3.5 h-3.5 text-green-500" />;
        case 'DELIVERED':
            return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
        case 'CANCELLED':
            return <XCircle className="w-3.5 h-3.5 text-destructive" />;
        default:
            return <AlertCircle className="w-3.5 h-3.5" />;
    }
};

export const sortOrders = (orders: Order[], sortBy: OrdersSortBy) => {
    const sorted = [...orders];

    sorted.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return getOrderDate(b).getTime() - getOrderDate(a).getTime();
            case 'date-asc':
                return getOrderDate(a).getTime() - getOrderDate(b).getTime();
            case 'total-desc':
                return b.total - a.total;
            case 'total-asc':
                return a.total - b.total;
            default:
                return 0;
        }
    });

    return sorted;
};

const isOrderWithinDateFilter = (order: Order, dateFilter: OrdersDateFilter, dateRange?: OrdersDateRange) => {
    if (dateFilter === 'all') {
        return true;
    }

    const orderDate = getOrderDate(order);
    const now = new Date();
    const today = startOfDay(now);

    if (dateFilter === 'custom') {
        if (!dateRange?.from) return true;

        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

        return orderDate >= from && orderDate <= to;
    }

    let startDate: Date;

    switch (dateFilter) {
        case 'today':
            startDate = today;
            break;
        case '7days':
            startDate = subDays(today, 7);
            break;
        case '30days':
            startDate = subDays(today, 30);
            break;
        case '90days':
            startDate = subDays(today, 90);
            break;
        case '12months':
            startDate = subMonths(today, 12);
            break;
        default:
            startDate = new Date(0);
    }

    return orderDate >= startDate;
};

export const getFilteredAndSortedOrders = (
    orders: Order[],
    options: {
        sortBy: OrdersSortBy;
        statusFilter: string;
        dateFilter: OrdersDateFilter;
        dateRange?: OrdersDateRange;
    }
) => {
    const { sortBy, statusFilter, dateFilter, dateRange } = options;

    const filtered = orders.filter((order) => {
        const matchesStatus =
            statusFilter === 'all' || order.status.toUpperCase() === statusFilter.toUpperCase();
        const matchesDate = isOrderWithinDateFilter(order, dateFilter, dateRange);

        return matchesStatus && matchesDate;
    });

    return sortOrders(filtered, sortBy);
};

export const getOrderItemsCount = (order: Order) => {
    return order.items.reduce((accumulator, item) => accumulator + item.quantity, 0);
};

export const getOrderSavingsAmount = (order: Order) => {
    return order.items.reduce((accumulator, item) => {
        const basePrice = item.product.originalPrice || item.product.price;
        return accumulator + (basePrice - item.price) * item.quantity;
    }, 0);
};
