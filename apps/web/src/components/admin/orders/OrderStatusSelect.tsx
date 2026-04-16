'use client';

import React, { useState } from 'react';
import { OrderStatus } from '@/types';
import { getOrderStatusColor, ORDER_STATUS_LABELS } from '@/services/orderService';
import { Loader2 } from 'lucide-react';
import { confirm } from '@/utils/confirm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
    onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
    disabled?: boolean;
}

export default function OrderStatusSelect({
    orderId,
    currentStatus,
    onStatusChange,
    disabled = false
}: OrderStatusSelectProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localStatus, setLocalStatus] = useState<OrderStatus>(currentStatus);

    // Sincronizar estado local cuando cambia el padre
    React.useEffect(() => {
        setLocalStatus(currentStatus);
    }, [currentStatus]);

    const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    const handleStatusUpdate = async (value: string) => {
        const newStatus = value as OrderStatus;
        if (newStatus === currentStatus) return;

        // Mostrar el cambio inmediatamente en el UI
        setLocalStatus(newStatus);

        // Confirmación para cancelaciones
        if (newStatus === 'CANCELLED') {
            const confirmed = await confirm(
                '¿Estás seguro de que deseas cancelar esta orden?',
                'Esta acción no se puede deshacer.'
            );
            if (!confirmed) {
                setLocalStatus(currentStatus);
                return;
            }
        }

        try {
            setIsUpdating(true);
            await onStatusChange(orderId, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
            setLocalStatus(currentStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative inline-block w-fit">
            {isUpdating && (
                <div className="absolute inset-y-0 right-10 flex items-center pr-2 pointer-events-none z-10">
                    <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                </div>
            )}
            <Select
                value={localStatus}
                onValueChange={handleStatusUpdate}
                disabled={disabled || isUpdating}
            >
                <SelectTrigger
                    className={cn(
                        "flex items-center gap-2 h-7 px-2.5 text-[9px] uppercase font-black rounded-sm border transition-all focus:ring-1 focus:ring-primary/20",
                        getOrderStatusColor(localStatus),
                        (disabled || isUpdating) ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95'
                    )}
                >
                    <SelectValue>{ORDER_STATUS_LABELS[localStatus]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {statuses.map((status) => (
                        <SelectItem
                            key={status}
                            value={status}
                            className="uppercase text-xs font-bold"
                        >
                            {ORDER_STATUS_LABELS[status]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
