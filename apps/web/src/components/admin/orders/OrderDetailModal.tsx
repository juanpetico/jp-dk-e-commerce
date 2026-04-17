'use client';

import React from 'react';
import { confirm } from '@/utils/confirm';
import { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/services/orderService';
import {
    OrderAddresses,
    OrderCustomerSummary,
    OrderDetailFooter,
    OrderDetailHeader,
    OrderItemsList,
    OrderTotals,
} from './OrderDetailModal.sections';
import { buildOrderSnapshotData } from './OrderDetailModal.utils';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
    onRedirect?: () => void;
}

export default function OrderDetailModal({ isOpen, onClose, order, onStatusChange, onRedirect }: OrderDetailModalProps) {
    if (!isOpen || !order) return null;

    const { shipping, billing, customer } = buildOrderSnapshotData(order);

    const handleStatusChange = async (newStatus: string) => {
        const status = newStatus as OrderStatus;
        if (status === order.status) return;

        const confirmed = await confirm(
            '¿Guardar cambio de estado?',
            `La orden pasará a "${ORDER_STATUS_LABELS[status]}".`
        );
        if (!confirmed) return;

        if (onStatusChange) {
            onStatusChange(order.id, status);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-background w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden border-2 border-foreground/20"
                onClick={(e) => e.stopPropagation()}
            >
                <OrderDetailHeader
                    order={order}
                    onClose={onClose}
                    onStatusChange={handleStatusChange}
                    statusEditable={!!onStatusChange}
                    onRedirect={onRedirect}
                />

                <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1">
                    <OrderCustomerSummary customer={customer} />
                    <OrderAddresses shipping={shipping} billing={billing} />
                    <OrderItemsList order={order} />
                </div>

                <OrderTotals order={order} />
                <OrderDetailFooter onClose={onClose} />
            </div>
        </div>
    );
}
