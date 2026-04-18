import { Calendar, Check, Copy, Ticket } from 'lucide-react';
import { CouponsPageGridProps } from './CouponsPage.types';
import { formatCouponValue, getCouponExpiryLabel } from './CouponsPage.utils';

export default function CouponsPageGrid({ coupons, copiedCode, onCopy }: CouponsPageGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map((item) => (
                <div
                    key={item.id}
                    className="relative bg-card text-card-foreground overflow-hidden rounded-2xl border border-gray-300 dark:border-border shadow-sm group hover:shadow-md transition-all duration-300"
                >
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full border border-gray-300 dark:border-border -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full border border-gray-300 dark:border-border -translate-y-1/2" />

                    <div className="flex flex-col h-full">
                        <div className="p-6 pb-4 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
                                    <Ticket className="w-5 h-5 text-primary" />
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-primary">{formatCouponValue(item.coupon)}</span>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OFF</p>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1 leading-tight">{item.coupon.description || 'Cupon de Descuento'}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{getCouponExpiryLabel(item.coupon.endDate)}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 dark:border-border px-6 py-4 bg-muted/30 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Codigo</span>
                                <code className="text-sm font-black tracking-wider text-foreground">{item.coupon.code}</code>
                            </div>
                            <button
                                onClick={() => onCopy(item.coupon.code)}
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
    );
}
