'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { CheckoutSummary, OrderConfirmation, PaymentMethodSelector } from '@/components/checkout';
import { fetchMyCoupons, MyCoupon } from '@/services/couponService';
import { createOrder, validateCoupon } from '@/services/orderService';
import { shopConfigService } from '@/services/shopConfigService';
import { useCart } from '@/store/CartContext';
import { useUser } from '@/store/UserContext';
import { CartItem, Coupon, OrderStatus } from '@/types';
import CheckoutPageContactCard from './CheckoutPage.contact-card';
import { SHIPPING_FALLBACK, calculateCouponDiscount, formatCheckoutAddress, mapOrderItemsPayload } from './CheckoutPage.utils';

export default function CheckoutPageClient() {
    const { cart, cartTotal, buyNowItem, appliedCoupon, setAppliedCoupon, clearCart } = useCart();
    const { user, isAuthenticated, refreshUser } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isBuyNow = searchParams.get('buyNow') === 'true';

    const [paymentMethod, setPaymentMethod] = useState('mercadopago');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [earnedCoupon, setEarnedCoupon] = useState<{ code: string; message: string } | null>(null);
    const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
    const [snapshotTotal, setSnapshotTotal] = useState(0);
    const [snapshotDiscount, setSnapshotDiscount] = useState(0);
    const [snapshotStatus, setSnapshotStatus] = useState<OrderStatus | null>(null);
    const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [showVIPModal, setShowVIPModal] = useState(false);
    const [userCoupons, setUserCoupons] = useState<MyCoupon[]>([]);
    const [showWallet, setShowWallet] = useState(false);
    const [shopConfig, setShopConfig] = useState(SHIPPING_FALLBACK);

    useEffect(() => {
        if (!isAuthenticated && !user) {
            const redirectUrl = isBuyNow ? '/checkout?buyNow=true' : '/checkout';
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }

        if (isAuthenticated) {
            void fetchMyCoupons().then(setUserCoupons).catch(() => undefined);
            void shopConfigService
                .getConfig()
                .then((config) =>
                    setShopConfig({
                        baseShippingCost: config.baseShippingCost,
                        freeShippingThreshold: config.freeShippingThreshold,
                    })
                )
                .catch(() => undefined);
        }
    }, [isAuthenticated, user, router, isBuyNow]);

    const defaultAddress = user?.addresses?.find((address) => address.isDefault) || user?.addresses?.[0];
    const shippingAddressId = defaultAddress?.id;
    const billingAddressId = defaultAddress?.id;
    const formattedAddress = formatCheckoutAddress(defaultAddress);

    const effectiveItems = useMemo(() => {
        if (isBuyNow && buyNowItem) {
            return [buyNowItem];
        }

        return cart;
    }, [isBuyNow, buyNowItem, cart]);

    const effectiveTotal = useMemo(() => {
        if (isBuyNow && buyNowItem) {
            return buyNowItem.price * buyNowItem.quantity;
        }

        return cartTotal;
    }, [isBuyNow, buyNowItem, cartTotal]);

    const couponDiscount = calculateCouponDiscount(effectiveTotal, appliedCoupon);
    const netAmount = effectiveTotal - couponDiscount;
    const isFreeShipping = effectiveTotal >= shopConfig.freeShippingThreshold;
    const shippingCost = isFreeShipping ? 0 : shopConfig.baseShippingCost;
    const finalTotal = netAmount + shippingCost;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsValidatingCoupon(true);
        try {
            const coupon = (await validateCoupon(couponCode, effectiveTotal)) as Coupon;
            setAppliedCoupon(coupon);
            toast.success(`Cupon "${coupon.code}" aplicado correctamente`);
        } catch (error: unknown) {
            setAppliedCoupon(null);
            const message = error instanceof Error ? error.message : 'Cupon invalido';
            toast.error(message);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handlePayment = async () => {
        if (effectiveItems.length === 0) {
            toast.error('El carrito esta vacio');
            return;
        }

        if (!shippingAddressId) {
            toast.error('Debes agregar una direccion de envio en tu perfil');
            return;
        }

        setIsProcessing(true);

        try {
            const orderItems = mapOrderItemsPayload(effectiveItems);
            const order = await createOrder(orderItems, shippingAddressId, billingAddressId, appliedCoupon?.code);

            await refreshUser();

            setOrderId(order.id);
            setOrderedItems(effectiveItems);
            setSnapshotTotal(finalTotal);
            setSnapshotDiscount(couponDiscount);
            setSnapshotStatus(order.status);

            if (order.earnedCoupon) {
                setEarnedCoupon(order.earnedCoupon);
                setShowVIPModal(true);
            }

            setIsSuccess(true);
            toast.success('Pedido creado exitosamente');
            clearCart();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al procesar el pedido';
            toast.error(message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return null;
    }

    if (isSuccess) {
        return (
            <OrderConfirmation
                orderId={orderId || ''}
                orderedItems={orderedItems}
                snapshotTotal={snapshotTotal}
                snapshotDiscount={snapshotDiscount}
                snapshotStatus={snapshotStatus}
                earnedCoupon={earnedCoupon}
                showVIPModal={showVIPModal}
                setShowVIPModal={setShowVIPModal}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-12 font-sans animate-fade-in">
            <div className="lg:col-span-7 px-4 py-4 md:px-8 lg:px-12 lg:py-8 order-2 lg:order-1 border-r border-border">
                <div className="max-w-xl ml-auto mr-auto lg:mr-0">
                    <div className="mb-6 flex items-center justify-between">
                        <Link href="/" className="font-display text-3xl md:text-4xl font-black italic tracking-tighter text-foreground hover:scale-105 transition-transform inline-block">
                            JP DK
                        </Link>
                        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors lg:hidden">
                            Volver
                        </Link>
                    </div>

                    <div className="space-y-6">
                        <CheckoutPageContactCard
                            email={user.email}
                            formattedAddress={formattedAddress}
                            shippingCostLabel={isFreeShipping ? 'Gratis' : `$${shippingCost.toLocaleString('es-CL')}`}
                        />

                        <PaymentMethodSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

                        <div className="mt-8">
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl hover:translate-y-0.5 transition-all"
                            >
                                {isProcessing ? 'Procesando...' : 'Pagar ahora'}
                            </Button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Politica de reembolso</a>
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Politica de envio</a>
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Politica de privacidad</a>
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Terminos del servicio</a>
                        </div>
                    </div>
                </div>
            </div>

            <CheckoutSummary
                items={effectiveItems}
                subtotal={effectiveTotal}
                shippingCost={shippingCost}
                isFreeShipping={isFreeShipping}
                freeShippingThreshold={shopConfig.freeShippingThreshold}
                appliedCoupon={appliedCoupon}
                couponDiscount={couponDiscount}
                finalTotal={finalTotal}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                isValidatingCoupon={isValidatingCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                userCoupons={userCoupons}
                showWallet={showWallet}
                setShowWallet={setShowWallet}
            />
        </div>
    );
}
