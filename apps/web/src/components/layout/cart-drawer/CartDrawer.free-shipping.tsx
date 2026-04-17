import { Truck } from 'lucide-react';
import { CartDrawerFreeShippingProps } from './CartDrawer.types';

export default function CartDrawerFreeShipping({
    freeShippingEnabled,
    remainingForFreeShipping,
    progressPercentage,
    formatPrice,
}: CartDrawerFreeShippingProps) {
    if (!freeShippingEnabled) {
        return null;
    }

    return (
        <div className="px-6 pt-4 pb-2">
            {remainingForFreeShipping > 0 ? (
                <>
                    <p className="text-sm text-center mb-2">
                        Compra <span className="font-bold">{formatPrice(remainingForFreeShipping)}</span> mas para tener{' '}
                        <span className="font-bold">envio GRATIS</span>
                    </p>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden mt-2 border border-zinc-200 dark:border-zinc-700">
                        <div
                            className="bg-black dark:bg-white h-full transition-all duration-500 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-2 mt-2">
                    <span className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                        <Truck className="w-5 h-5" />
                        !Tienes envio gratis!
                    </span>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden mt-2 border border-zinc-200 dark:border-zinc-700">
                        <div className="bg-green-600 dark:bg-green-400 h-full w-full" />
                    </div>
                </div>
            )}
        </div>
    );
}
