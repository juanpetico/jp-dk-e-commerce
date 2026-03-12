'use client';

import React from 'react';
import { Button } from './Button';
import { Ticket, X, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
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
                    "relative w-full max-w-md bg-card border-4 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-500",
                    isVIP ? "border-yellow-500 shadow-yellow-500/20" : "border-primary shadow-primary/20"
                )}
            >
                {/* Background Decor */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-32 opacity-10",
                    isVIP ? "bg-yellow-500" : "bg-primary"
                )} />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative p-8 text-center pt-12">
                    <div className={cn(
                        "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 animate-bounce-subtle",
                        isVIP ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" : "bg-primary/10 text-primary"
                    )}>
                        {isVIP ? <Trophy className="w-10 h-10" /> : <Sparkles className="w-10 h-10" />}
                    </div>

                    <h2 className="font-display text-3xl font-black uppercase tracking-tighter mb-2 italic">
                        {isVIP ? '¡Nivel VIP Alcanzado!' : '¡Bienvenido a la Gang!'}
                    </h2>

                    <p className="text-muted-foreground font-medium mb-8">
                        {message || (isVIP
                            ? 'Has desbloqueado un beneficio exclusivo por tu gran compra.'
                            : 'Gracias por unirte. Tenemos un regalo para tu primera compra.')}
                    </p>

                    <div className="bg-muted px-6 py-8 rounded-xl border-2 border-dashed border-border mb-8 relative group overflow-hidden">
                        <div className="absolute top-2 left-2 opacity-5">
                            <Ticket className="w-12 h-12 rotate-12" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Tu Código de Descuento</p>
                        <p className={cn(
                            "text-4xl font-black tracking-widest font-mono",
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
