'use client';

import React from 'react';
import { Button } from './Button';
import { X, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LoyaltyModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'WELCOME' | 'VIP';
    couponCode: string;
    message?: string;
}

export function LoyaltyModal({ isOpen, onClose, type, couponCode, message }: LoyaltyModalProps) {
    if (!isOpen) return null;

    const isVIP = type === 'VIP';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-500 border bg-card dark:bg-black",
                    isVIP ? "border-yellow-500/40 shadow-yellow-500/20" : "border-border shadow-primary/20"
                )}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative text-center pt-6 px-6 pb-8">
                    <div className={cn(
                        "mx-auto mb-6 flex h-12 w-12 items-center justify-center animate-bounce-subtle",
                        isVIP ? "text-yellow-500" : "text-primary"
                    )}>
                        {isVIP ? <Trophy className="h-10 w-10" /> : <Sparkles className="h-10 w-10" />}
                    </div>

                    <h2 className="font-display text-3xl font-black uppercase tracking-tighter mb-2 italic">
                        {isVIP ? '¡Nivel VIP Alcanzado!' : '¡Bienvenido a la Gang!'}
                    </h2>

                    <p className="text-muted-foreground font-medium mb-8">
                        {message || (isVIP
                            ? 'Has desbloqueado un beneficio exclusivo por tu gran compra.'
                            : 'Gracias por unirte. Tenemos un regalo para tu primera compra.')}
                    </p>

                    <div className="mb-8 rounded-xl bg-muted px-4 py-8 sm:px-6 relative overflow-hidden dark:bg-black">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Tu Código de Descuento</p>
                        <p className={cn(
                            "max-w-full break-all text-center font-mono text-xl font-black tracking-[0.2em] sm:text-2xl",
                            isVIP ? "text-yellow-600 dark:text-yellow-400" : "text-primary font-display"
                        )}>
                            {couponCode}
                        </p>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" />
                            Añadido a tu billetera
                        </div>
                    </div>

                    <Button
                        onClick={onClose}
                        className={cn(
                            "w-full h-14 text-lg font-black uppercase tracking-widest rounded-xl transition-all active:scale-95",
                            isVIP ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        )}
                    >
                        ¡Genial!
                    </Button>

                    <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Puedes usarlo ahora mismo en el checkout
                    </p>
                </div>
            </div>
        </div>
    );
}
