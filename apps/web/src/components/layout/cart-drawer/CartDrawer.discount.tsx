import { ChevronDown, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { CartDrawerDiscountSectionProps } from './CartDrawer.types';

export default function CartDrawerDiscountSection({
    appliedCoupon,
    showDiscountInput,
    discountCode,
    isValidating,
    isAuthenticated,
    showWallet,
    userCoupons,
    onOpenDiscountInput,
    onRemoveCoupon,
    onDiscountCodeChange,
    onApplyCoupon,
    onToggleWallet,
    onSelectCouponCode,
    onCloseDiscountInput,
}: CartDrawerDiscountSectionProps) {
    if (appliedCoupon) {
        return (
            <div className="p-4 bg-primary/5 border-b border-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <div>
                        <p className="text-xs font-bold text-primary uppercase">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-muted-foreground">Descuento aplicado</p>
                    </div>
                </div>
                <button onClick={onRemoveCoupon} className="text-[10px] font-bold text-destructive hover:underline uppercase">
                    Quitar
                </button>
            </div>
        );
    }

    if (!showDiscountInput) {
        return (
            <button
                onClick={onOpenDiscountInput}
                className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors text-sm font-medium"
            >
                <Ticket className="w-4 h-4" />
                Ingresar descuento
            </button>
        );
    }

    return (
        <div className="p-4 bg-muted/20 animate-in slide-in-from-top-2 border-gray-300">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="CODIGO"
                    className="flex-1 border border-input rounded px-3 py-2 text-xs font-bold uppercase bg-background"
                    value={discountCode}
                    onChange={(event) => onDiscountCodeChange(event.target.value.toUpperCase())}
                    autoFocus
                    onKeyDown={(event) => event.key === 'Enter' && onApplyCoupon()}
                />
                <Button
                    size="sm"
                    onClick={onApplyCoupon}
                    disabled={isValidating || !discountCode.trim()}
                    className="bg-black text-white dark:bg-white dark:text-black font-bold h-9"
                >
                    {isValidating ? '...' : 'OK'}
                </Button>
            </div>

            {isAuthenticated && userCoupons.length > 0 && (
                <div className="mt-3">
                    <button
                        onClick={onToggleWallet}
                        className="text-[10px] font-bold text-primary hover:underline uppercase flex items-center gap-1"
                    >
                        {showWallet ? 'Ocultar mis cupones' : 'Ver mis cupones'}
                        <ChevronDown className={cn('w-3 h-3 transition-transform', showWallet && 'rotate-180')} />
                    </button>
                    {showWallet && (
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            {userCoupons.map((userCoupon) => (
                                <button
                                    key={userCoupon.id}
                                    onClick={() => onSelectCouponCode(userCoupon.coupon.code)}
                                    className="w-full text-left p-2 border border-border rounded hover:bg-muted transition-colors text-[10px]"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">{userCoupon.coupon.code}</span>
                                        <span className="text-muted-foreground">
                                            {userCoupon.coupon.type === 'PERCENTAGE'
                                                ? `${userCoupon.coupon.value}%`
                                                : `$${userCoupon.coupon.value.toLocaleString('es-CL')}`}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={onCloseDiscountInput}
                className="text-[10px] text-muted-foreground mt-3 hover:underline uppercase font-bold"
            >
                Cancelar
            </button>
        </div>
    );
}
