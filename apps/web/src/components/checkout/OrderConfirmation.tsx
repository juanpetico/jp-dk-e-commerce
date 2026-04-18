'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/services/orderService';
import { Check, Ticket, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoyaltyModal } from '@/components/ui/LoyaltyModal';
import { toast } from 'sonner';

interface OrderConfirmationProps {
    orderId: string;
    orderedItems: any[];
    snapshotTotal: number;
    snapshotDiscount: number;
    snapshotStatus: OrderStatus | null;
    earnedCoupon: { code: string; message: string } | null;
    showVIPModal: boolean;
    setShowVIPModal: (show: boolean) => void;
}

export function OrderConfirmation({
    orderId,
    orderedItems,
    snapshotTotal,
    snapshotDiscount,
    snapshotStatus,
    earnedCoupon,
    showVIPModal,
    setShowVIPModal,
}: OrderConfirmationProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <LoyaltyModal
                isOpen={showVIPModal}
                onClose={() => setShowVIPModal(false)}
                type="VIP"
                couponCode={earnedCoupon?.code || ''}
                message={earnedCoupon?.message}
            />
            <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
<div className="rounded-full bg-green-100 p-4">
                        <Check className="w-16 h-16 text-green-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="font-display text-4xl font-bold tracking-tight uppercase italic">¡Gracias por tu compra!</h1>
                    <p className="text-muted-foreground font-medium">Tu pedido #{orderId} ha sido procesado con éxito.</p>
                </div>

                {/* Order Info Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-xl p-6 border border-border text-left space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Detalles del Pedido</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Estado</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 capitalize">
                                {snapshotStatus ? ORDER_STATUS_LABELS[snapshotStatus] : ''}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Total Pagado</span>
                            <span className="font-bold font-mono">${snapshotTotal.toLocaleString('es-CL')}</span>
                        </div>
                        {snapshotDiscount > 0 && (
                            <div className="flex justify-between text-sm text-primary font-bold">
                                <span>Descuento aplicado</span>
                                <span>-${snapshotDiscount.toLocaleString('es-CL')}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-muted/30 rounded-xl p-6 border border-border text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Resumen de Productos</h3>
                        <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                            {orderedItems.map(item => (
                                <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-10 bg-muted rounded overflow-hidden flex-shrink-0 border border-border/50">
                                            <img src={item.images?.[0]?.url} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-foreground truncate max-w-[120px] uppercase">{item.name}</p>
                                            <p className="text-[9px] text-muted-foreground font-medium uppercase">{item.selectedSize} x {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {earnedCoupon && (
                    <div className="p-5 bg-primary/10 border border-primary/20 rounded-xl animate-bounce-subtle flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                            <Ticket className="w-6 h-6 text-primary" />
                            <span className="font-black text-primary tracking-tighter text-lg uppercase italic">¡NUEVO CUPÓN DESBLOQUEADO!</span>
                        </div>
                        <p className="text-sm font-medium text-foreground text-center mb-3">{earnedCoupon.message}</p>
                        <div className="bg-background border-2 border-dashed border-primary/40 px-6 py-3 rounded-lg flex items-center gap-4">
                            <span className="text-2xl font-black text-primary font-mono tracking-tighter">{earnedCoupon.code}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(earnedCoupon.code);
                                    toast.success("Código copiado al portapapeles");
                                }}
                                className="p-1 hover:text-primary transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-3">
                    <Button
                        onClick={() => router.push('/orders')}
                        className="flex-1 h-14 text-sm font-black uppercase tracking-widest shadow-xl hover:translate-y-0.5 transition-all"
                    >
                        Ver mis pedidos
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="flex-1 h-14 text-sm font-black uppercase tracking-widest border-2 hover:bg-muted/50 transition-colors"
                    >
                        Volver a la Tienda
                    </Button>
                </div>
            </div>
        </div>
    );
}
