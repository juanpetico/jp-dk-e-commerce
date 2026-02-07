'use client';

import React, { useState, useEffect } from 'react';
import { fetchMyCoupons } from '../../../src/services/couponService';
import { Ticket, Calendar, Clock, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function MyCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        const loadCoupons = async () => {
            try {
                const data = await fetchMyCoupons();
                setCoupons(data);
            } catch (error) {
                console.error('Error loading coupons:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCoupons();
    }, []);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Código ${code} copiado`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl">
                <header className="mb-10">
                    <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Mis Descuentos</h1>
                    <p className="text-muted-foreground">Aquí encontrarás todos tus beneficios y cupones exclusivos.</p>
                </header>

                {coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-2xl">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Ticket className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No tienes cupones activos</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                            Sigue comprando para desbloquear beneficios exclusivos y cupones de regalo.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coupons.map((item) => (
                            <div
                                key={item.id}
                                className="relative bg-card overflow-hidden rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all duration-300"
                            >
                                {/* Ticket Notch Effect */}
                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full border border-border -translate-y-1/2"></div>
                                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full border border-border -translate-y-1/2"></div>

                                <div className="flex flex-col h-full">
                                    <div className="p-6 pb-4 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
                                                <Ticket className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-primary">
                                                    {item.coupon.type === 'PERCENTAGE'
                                                        ? `${item.coupon.value}%`
                                                        : `$${item.coupon.value.toLocaleString('es-CL')}`
                                                    }
                                                </span>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OFF</p>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg mb-1 leading-tight">{item.coupon.description || 'Cupón de Descuento'}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>
                                                {item.coupon.endDate
                                                    ? `Expira el ${new Date(item.coupon.endDate).toLocaleDateString('es-CL')}`
                                                    : 'Uso ilimitado (Sin expiración)'
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-dashed border-border px-6 py-4 bg-muted/30 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Código</span>
                                            <code className="text-sm font-black tracking-wider text-foreground">{item.coupon.code}</code>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(item.coupon.code)}
                                            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all active:scale-95"
                                        >
                                            {copiedCode === item.coupon.code ? (
                                                <>
                                                    <Check className="w-3 h-3" />
                                                    Copiado
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    Copiar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* VIP Perks Banner */}
                <div className="mt-12 p-8 bg-gradient-to-br from-[var(--color-amber-900)]/10 to-transparent rounded-3xl border border-[var(--color-amber-900)]/20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-black italic tracking-tighter mb-2">PROXIMAMENTE: NIVEL VIP</h2>
                            <p className="text-muted-foreground text-sm max-w-md">
                                Estamos trabajando en un sistema de niveles. Acumula puntos con tus compras y desbloquea descuentos permanentes, envíos gratis y acceso anticipado.
                            </p>
                        </div>
                        <div className="bg-[var(--color-amber-900)] text-white px-6 py-3 rounded-xl font-black italic shadow-lg shadow-[var(--color-amber-900)]/20">
                            PRONTO
                        </div>
                    </div>
                    {/* Decorative Background Icon */}
                    <div className="absolute -bottom-12 -right-12 opacity-5 scale-150 rotate-12">
                        <Ticket size={200} />
                    </div>
                </div>
            </div>
        </div>
    );
}
