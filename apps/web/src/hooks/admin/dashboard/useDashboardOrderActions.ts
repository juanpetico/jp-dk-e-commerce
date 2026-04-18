import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS, updateOrderStatus } from '@/services/orderService';

interface UseDashboardOrderActionsParams {
    setOrders: Dispatch<SetStateAction<Order[]>>;
}

export function useDashboardOrderActions({ setOrders }: UseDashboardOrderActionsParams) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: OrderStatus } | null>(null);

    const handleStatusUpdate = useCallback(async (orderId: string, newStatus: OrderStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));

            setSelectedOrder((prev) => {
                if (!prev || prev.id !== orderId) return prev;
                return updatedOrder;
            });

            toast.success(`Orden actualizada a ${ORDER_STATUS_LABELS[newStatus]}`);
        } catch (error) {
            console.error('Error in status update:', error);
            toast.error('No se pudo actualizar el estado');
        }
    }, [setOrders]);

    const handleViewOrder = useCallback((order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    }, []);

    const closeOrderModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const clearPendingStatusChange = useCallback(() => {
        setPendingStatusChange(null);
    }, []);

    const confirmPendingStatusChange = useCallback(async () => {
        if (!pendingStatusChange) return;
        const { id, status } = pendingStatusChange;
        setPendingStatusChange(null);
        await handleStatusUpdate(id, status);
    }, [pendingStatusChange, handleStatusUpdate]);

    return {
        selectedOrder,
        isModalOpen,
        pendingStatusChange,
        setPendingStatusChange,
        handleStatusUpdate,
        handleViewOrder,
        closeOrderModal,
        clearPendingStatusChange,
        confirmPendingStatusChange,
    };
}
