'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/store/CartContext';
import { useUser } from '@/store/UserContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createOrder, validateCoupon } from '@/services/orderService';
import { fetchMyCoupons } from '@/services/couponService';
import { shopConfigService } from '@/services/shopConfigService';
import { OrderStatus } from '@/types';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { CheckoutSummary, PaymentMethodSelector, OrderConfirmation } from '@/components/checkout';

const SHIPPING_FALLBACK = { baseShippingCost: 3990, freeShippingThreshold: 50000 };

export default function CheckoutPage() {
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
    const [orderedItems, setOrderedItems] = useState<any[]>([]);
    const [snapshotTotal, setSnapshotTotal] = useState(0);
    const [snapshotDiscount, setSnapshotDiscount] = useState(0);
    const [snapshotStatus, setSnapshotStatus] = useState<OrderStatus | null>(null);
    const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [showVIPModal, setShowVIPModal] = useState(false);
    const [userCoupons, setUserCoupons] = useState<any[]>([]);
    const [showWallet, setShowWallet] = useState(false);
    const [shopConfig, setShopConfig] = useState(SHIPPING_FALLBACK);

    useEffect(() => {
        if (!isAuthenticated && !user) {
            const redirectUrl = isBuyNow ? '/checkout?buyNow=true' : '/checkout';
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }
        if (isAuthenticated) {
            fetchMyCoupons().then(setUserCoupons).catch(() => {});
            shopConfigService.getConfig()
                .then(cfg => setShopConfig({
                    baseShippingCost: cfg.baseShippingCost,
                    freeShippingThreshold: cfg.freeShippingThreshold,
                }))
                .catch(() => {}); // mantiene fallback
        }
    }, [isAuthenticated, user, router, isBuyNow]);

    const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
    const shippingAddressId = defaultAddress?.id;
    const billingAddressId = defaultAddress?.id;
    const formattedAddress = defaultAddress
        ? `${defaultAddress.name}, ${defaultAddress.rut || ''}, ${defaultAddress.street}, ${defaultAddress.comuna}, ${defaultAddress.country}, ${defaultAddress.phone}`
        : 'No tienes direcciones guardadas. Por favor agrega una.';

    const effectiveItems = (isBuyNow && buyNowItem) ? [buyNowItem] : cart;
    const effectiveTotal = (isBuyNow && buyNowItem) ? buyNowItem.price * buyNowItem.quantity : cartTotal;

    let couponDiscount = 0;
    if (appliedCoupon) {
        couponDiscount = appliedCoupon.type === 'PERCENTAGE'
            ? Math.round(effectiveTotal * (appliedCoupon.value / 100))
            : Math.min(appliedCoupon.value, effectiveTotal);
    }

    const netAmount = effectiveTotal - couponDiscount;
    const isFreeShipping = effectiveTotal >= shopConfig.freeShippingThreshold;
    const shippingCost = isFreeShipping ? 0 : shopConfig.baseShippingCost;
    const finalTotal = netAmount + shippingCost;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsValidatingCoupon(true);
        try {
            const coupon = await validateCoupon(couponCode, effectiveTotal);
            setAppliedCoupon(coupon);
            toast.success(`Cupón "${coupon.code}" aplicado correctamente`);
        } catch (error: any) {
            setAppliedCoupon(null);
            toast.error(error.message || 'Cupón inválido');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handlePayment = async () => {
        if (effectiveItems.length === 0) { toast.error('El carrito está vacío'); return; }
        if (!shippingAddressId) { toast.error('Debes agregar una dirección de envío en tu perfil'); return; }
        setIsProcessing(true);
        try {
            const orderItems = effectiveItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                size: item.selectedSize,
            }));
            const order = await createOrder(orderItems, shippingAddressId, billingAddressId, appliedCoupon?.code);
            await refreshUser();
            setOrderId(order.id);
            setOrderedItems(effectiveItems);
            setSnapshotTotal(finalTotal);
            setSnapshotDiscount(couponDiscount);
            setSnapshotStatus(order.status);
            if (order.earnedCoupon) { setEarnedCoupon(order.earnedCoupon); setShowVIPModal(true); }
            setIsSuccess(true);
            toast.success('Pedido creado exitosamente');
            clearCart();
        } catch (error: any) {
            toast.error(error.message || 'Error al procesar el pedido');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    if (isSuccess) {
        return (
            <OrderConfirmation
                orderId={orderId!}
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
            {/* Columna izquierda */}
            <div className="lg:col-span-7 px-4 py-4 md:px-8 lg:px-12 lg:py-8 order-2 lg:order-1 border-r border-border">
                <div className="max-w-xl ml-auto mr-auto lg:mr-0">
                    <div className="mb-6 flex items-center justify-between">
                        <Link href="/" className="font-display text-3xl md:text-4xl font-black italic tracking-tighter text-foreground hover:scale-105 transition-transform inline-block">JP DK</Link>
                        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors lg:hidden">Volver</Link>
                    </div>

                    <div className="space-y-6">
                        {/* Info de contacto, dirección y método */}
                        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm text-sm">
                            <div className="p-4 border-b border-border flex justify-between items-start">
                                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                                    <p className="text-muted-foreground text-xs font-medium">Contacto</p>
                                    <p className="font-medium text-foreground truncate">{user?.email}</p>
                                </div>
                                <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors"><Edit2 className="w-4 h-4" /></Link>
                            </div>
                            <div className="p-4 border-b border-border flex justify-between items-start">
                                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                                    <p className="text-muted-foreground text-xs font-medium">Enviar a</p>
                                    <p className="font-medium text-foreground leading-snug text-xs md:text-sm">{formattedAddress}</p>
                                </div>
                                <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors"><Edit2 className="w-4 h-4" /></Link>
                            </div>
                            <div className="p-4 flex items-center">
                                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                                    <p className="text-muted-foreground text-xs font-medium">Método</p>
                                    <p className="font-medium text-foreground text-xs md:text-sm">
                                        Envío Estándar · <span className="font-bold">{isFreeShipping ? 'Gratis' : `$${shippingCost.toLocaleString('es-CL')}`}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

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
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Política de reembolso</a>
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Política de envío</a>
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Política de privacidad</a>
                            <a href="#" className="hover:text-foreground underline decoration-1 underline-offset-2">Términos del servicio</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Columna derecha - Resumen */}
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
