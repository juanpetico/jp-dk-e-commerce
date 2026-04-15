'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PaymentMethodSelectorProps {
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
}

export function PaymentMethodSelector({ paymentMethod, setPaymentMethod }: PaymentMethodSelectorProps) {
    return (
        <div className="mt-8">
            <h2 className="font-display text-lg font-bold uppercase mb-2 text-foreground">Pago</h2>
            <p className="text-xs text-muted-foreground mb-4">Todas las transacciones son seguras y están encriptadas.</p>

            <div className="border border-border rounded-lg overflow-hidden bg-card">
                {/* Mercado Pago */}
                <div
                    className={`p-4 flex items-center justify-between cursor-pointer border-b border-border transition-colors ${paymentMethod === 'mercadopago' ? 'bg-muted/30' : 'bg-card'}`}
                    onClick={() => setPaymentMethod('mercadopago')}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'mercadopago' ? 'border-primary' : 'border-muted-foreground'}`}>
                            {paymentMethod === 'mercadopago' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-bold text-sm text-foreground">Mercado Pago</span>
                    </div>
                    <div className="flex gap-1 items-center opacity-100">
                        <span className="text-[9px] font-black text-blue-500 italic bg-white border px-1 rounded">MP</span>
                        <span className="text-[9px] font-bold text-blue-800 bg-white border px-1 rounded">VISA</span>
                        <span className="text-[9px] font-bold text-red-600 bg-white border px-1 rounded">MC</span>
                    </div>
                </div>

                {paymentMethod === 'mercadopago' && (
                    <div className="p-8 bg-background text-center border-b border-border animate-fade-in flex flex-col items-center justify-center">
                        <ShieldCheck className="w-12 h-12 text-foreground mb-4 mx-auto" />
                        <p className="text-sm text-foreground font-medium max-w-xs mx-auto leading-relaxed">
                            Luego de hacer clic en &quot;Pagar ahora&quot;, serás redirigido a Mercado Pago para completar tu compra de forma segura.
                        </p>
                    </div>
                )}

                {/* Flow */}
                <div
                    className={`p-4 flex items-center justify-between cursor-pointer border-b border-border transition-colors ${paymentMethod === 'flow' ? 'bg-muted/30' : 'bg-card'}`}
                    onClick={() => setPaymentMethod('flow')}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'flow' ? 'border-primary' : 'border-muted-foreground'}`}>
                            {paymentMethod === 'flow' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-medium text-sm text-foreground">Checkout Flow</span>
                    </div>
                </div>

                {/* Transfer */}
                <div
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'transfer' ? 'bg-muted/30' : 'bg-card'}`}
                    onClick={() => setPaymentMethod('transfer')}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'transfer' ? 'border-primary' : 'border-muted-foreground'}`}>
                            {paymentMethod === 'transfer' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-medium text-sm text-foreground">Transferencia / Deposito</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
