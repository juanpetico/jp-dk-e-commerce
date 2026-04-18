"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/Button';
import { useShopConfigPublic } from '@/hooks/useShopConfigPublic';
import { fetchMyCoupons, MyCoupon } from '@/services/couponService';
import { validateCoupon } from '@/services/orderService';
import { useCart } from '@/store/CartContext';
import { useUser } from '@/store/UserContext';
import { CartItem } from '@/types';
import { toast } from 'sonner';
import CartDrawerFreeShipping from './CartDrawer.free-shipping';
import CartDrawerItem from './CartDrawer.item';
import CartDrawerDiscountSection from './CartDrawer.discount';
import CartDrawerFooter from './CartDrawer.footer';
import { formatPrice, getCartItemCount, getCouponDiscount } from './CartDrawer.utils';

export default function CartDrawerClient() {
    const {
        isOpen,
        toggleCart,
        cart,
        removeFromCart,
        updateQuantity,
        addToCart,
        cartTotal,
        appliedCoupon,
        setAppliedCoupon,
    } = useCart();
    const { isAuthenticated } = useUser();
    const { freeShippingThreshold } = useShopConfigPublic();

    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [userCoupons, setUserCoupons] = useState<MyCoupon[]>([]);
    const [showWallet, setShowWallet] = useState(false);

    const freeShippingEnabled = freeShippingThreshold > 0;
    const remainingForFreeShipping = freeShippingEnabled ? Math.max(0, freeShippingThreshold - cartTotal) : 0;
    const progressPercentage = freeShippingEnabled ? Math.min(100, (cartTotal / freeShippingThreshold) * 100) : 0;
    const couponDiscount = getCouponDiscount(appliedCoupon, cartTotal);
    const cartItemCount = getCartItemCount(cart);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            if (isAuthenticated) {
                const loadCoupons = async () => {
                    try {
                        const coupons = await fetchMyCoupons();
                        setUserCoupons(coupons);
                    } catch (error) {
                        console.error('Failed to load coupons', error);
                    }
                };

                loadCoupons();
            }
        } else {
            document.body.style.overflow = 'unset';
            setShowDiscountInput(false);
            setShowWallet(false);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAuthenticated, isOpen]);

    const handleSizeChange = (item: CartItem, newSize: string) => {
        if (newSize !== item.selectedSize) {
            removeFromCart(item.id, item.selectedSize);
            addToCart(item, newSize);
        }
    };

    const handleApplyCoupon = async () => {
        if (!discountCode.trim()) {
            return;
        }

        setIsValidating(true);
        try {
            const coupon = await validateCoupon(discountCode, cartTotal);
            setAppliedCoupon(coupon);
            toast.success(`Cupon "${coupon.code}" aplicado`);
            setShowDiscountInput(false);
            setDiscountCode('');
        } catch (error) {
            const fallbackMessage = 'Cupon invalido';
            const message = error instanceof Error ? error.message : fallbackMessage;
            toast.error(message || fallbackMessage);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={toggleCart}
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col text-foreground"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-background">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="flex items-center justify-center w-7 h-7 rounded bg-muted text-foreground text-xs font-bold">
                                    {cartItemCount}
                                </span>
                            </div>
                            <button
                                onClick={toggleCart}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <CartDrawerFreeShipping
                            freeShippingEnabled={freeShippingEnabled}
                            remainingForFreeShipping={remainingForFreeShipping}
                            progressPercentage={progressPercentage}
                            formatPrice={formatPrice}
                        />

                        <ScrollArea className="flex-1 bg-background">
                            <div className="p-6 space-y-8">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[50vh] text-center text-muted-foreground">
                                        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="text-lg font-medium mb-1">Tu carrito esta vacio</p>
                                        <Button variant="outline" className="mt-6" onClick={toggleCart}>
                                            Ver productos
                                        </Button>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <CartDrawerItem
                                            key={`${item.id}-${item.selectedSize}`}
                                            item={item}
                                            onRemove={removeFromCart}
                                            onUpdateQuantity={updateQuantity}
                                            onSizeChange={handleSizeChange}
                                            formatPrice={formatPrice}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        {cart.length > 0 && (
                            <div className="border-t border-border bg-background border-gray-300">
                                <div className="border-b border-gray-300">
                                    <CartDrawerDiscountSection
                                        appliedCoupon={appliedCoupon}
                                        showDiscountInput={showDiscountInput}
                                        discountCode={discountCode}
                                        isValidating={isValidating}
                                        isAuthenticated={isAuthenticated}
                                        showWallet={showWallet}
                                        userCoupons={userCoupons}
                                        onOpenDiscountInput={() => setShowDiscountInput(true)}
                                        onRemoveCoupon={handleRemoveCoupon}
                                        onDiscountCodeChange={setDiscountCode}
                                        onApplyCoupon={handleApplyCoupon}
                                        onToggleWallet={() => setShowWallet((current) => !current)}
                                        onSelectCouponCode={setDiscountCode}
                                        onCloseDiscountInput={() => setShowDiscountInput(false)}
                                    />
                                </div>

                                <CartDrawerFooter
                                    couponDiscount={couponDiscount}
                                    total={cartTotal - couponDiscount}
                                    formatPrice={formatPrice}
                                    onClose={toggleCart}
                                />
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
