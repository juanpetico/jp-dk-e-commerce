import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CartDrawerFooterProps } from './CartDrawer.types';
import { PAYMENT_METHODS } from './CartDrawer.utils';

export default function CartDrawerFooter({ couponDiscount, total, formatPrice, onClose }: CartDrawerFooterProps) {
    return (
        <div className="p-6 space-y-4 border-t-red-600">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="text-green-600 dark:text-green-400 font-bold">-{formatPrice(couponDiscount)}</span>
            </div>

            <div className="flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <div className="text-right">
                    <span className="text-xl font-bold">{formatPrice(total)}</span>
                </div>
            </div>

            <Button
                onClick={onClose}
                className="w-full bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black h-12 text-base font-bold uppercase tracking-wide"
                asChild
            >
                <Link href="/checkout" onClick={onClose} className="w-full h-full flex items-center justify-center">
                    Continuar
                </Link>
            </Button>

            <button
                onClick={onClose}
                className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors pb-2"
            >
                Continuar comprando
            </button>

            <div className="flex flex-col gap-2 pt-2">
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-bold">
                    Metodos de pago aceptados
                </p>
                <div className="flex justify-center gap-4 opacity-100 items-center">
                    {PAYMENT_METHODS.map((paymentMethod) => (
                        <div key={paymentMethod.name} className="flex flex-col items-center gap-1 group cursor-default">
                            <div className="w-10 h-7 rounded border border-gray-300 bg-white flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors overflow-hidden">
                                <img
                                    src={paymentMethod.logoUrl}
                                    alt={paymentMethod.name}
                                    className="w-full h-full object-contain p-0.5"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
