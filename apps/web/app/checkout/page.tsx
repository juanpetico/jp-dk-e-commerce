'use client';

import React, { useState } from 'react';
import { useCart } from '../../src/store/CartContext';
import { useUser } from '../../src/store/UserContext';
import { Button } from '../../src/components/ui/Button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createOrder, validateCoupon } from '../../src/services/orderService';
import { fetchMyCoupons } from '../../src/services/couponService';
import { Coupon } from '../../src/types';
import { ArrowLeft, Edit2, ShieldCheck, CreditCard, Truck, Check, Ticket, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { cart, cartTotal, buyNowItem } = useCart();
    const { user, isAuthenticated, refreshUser } = useUser();
    const [paymentMethod, setPaymentMethod] = useState('mercadopago');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [earnedCoupon, setEarnedCoupon] = useState<{ code: string; message: string } | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [userCoupons, setUserCoupons] = useState<any[]>([]);
    const [showWallet, setShowWallet] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isBuyNow = searchParams.get('buyNow') === 'true';

    // Redirect if not authenticated or empty cart (optional, but good UX)
    React.useEffect(() => {
        if (!isAuthenticated && !user) {
            const redirectUrl = isBuyNow ? '/checkout?buyNow=true' : '/checkout';
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        } else if (isAuthenticated) {
            // Cargar cupones de la billetera si el usuario está autenticado
            const loadWallet = async () => {
                try {
                    const data = await fetchMyCoupons();
                    setUserCoupons(data);
                } catch (error) {
                    console.error("Error loading wallet coupons:", error);
                }
            };
            loadWallet();
        }
    }, [isAuthenticated, user, router, isBuyNow]);

    // Addresses
    const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
    const shippingAddressId = defaultAddress?.id;
    const billingAddressId = defaultAddress?.id;

    const contactEmail = user?.email || "";

    // Formatted Address String
    const formattedAddress = defaultAddress
        ? `${defaultAddress.name}, ${defaultAddress.rut || ''}, ${defaultAddress.street}, ${defaultAddress.comuna}, ${defaultAddress.country}, ${defaultAddress.phone}`
        : "No tienes direcciones guardadas. Por favor agrega una.";

    const shippingCost = 3990;

    // Effective items logic: use buyNowItem if isBuyNow flag is set
    const effectiveItems = (isBuyNow && buyNowItem) ? [buyNowItem] : cart;
    const effectiveTotal = (isBuyNow && buyNowItem)
        ? buyNowItem.price * buyNowItem.quantity
        : cartTotal;

    // Coupon discount calculation
    let couponDiscount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'PERCENTAGE') {
            // CLP Standard rounding
            couponDiscount = Math.round(effectiveTotal * (appliedCoupon.value / 100));
        } else {
            couponDiscount = Math.min(appliedCoupon.value, effectiveTotal);
        }
    }

    const netAmount = effectiveTotal - couponDiscount;
    const taxes = 0;
    const finalTotal = netAmount + taxes + shippingCost;

    const displayCart = effectiveItems;
    const displayTotal = effectiveTotal;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsValidatingCoupon(true);
        try {
            const coupon = await validateCoupon(couponCode, effectiveTotal);
            setAppliedCoupon(coupon);
            toast.success(`Cupón "${coupon.code}" aplicado correctamente`);
        } catch (error: any) {
            setAppliedCoupon(null);
            toast.error(error.message || "Cupón inválido");
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
            toast.error("El carrito está vacío");
            return;
        }

        if (!shippingAddressId) {
            toast.error("Debes agregar una dirección de envío en tu perfil");
            return;
        }

        setIsProcessing(true);
        try {
            // Prepare items for backend
            const orderItems = effectiveItems.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                size: item.selectedSize
            }));

            // Create Order
            const order = await createOrder(
                orderItems,
                shippingAddressId,
                billingAddressId,
                appliedCoupon?.code
            );

            // Refresh user to get the new order in the list
            await refreshUser();

            setOrderId(order.id);
            if (order.earnedCoupon) {
                setEarnedCoupon(order.earnedCoupon);
                toast.success(order.earnedCoupon.message, {
                    duration: 6000,
                    icon: '🎉'
                });
            }
            setIsSuccess(true);
            toast.success("Pedido creado exitosamente");

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error al procesar el pedido");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) return null; // Wait for auth load

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                            <Check className="w-16 h-16 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-display text-3xl font-bold tracking-tight">¡Gracias por tu compra!</h1>
                        <p className="text-muted-foreground font-medium">Tu pedido #{orderId} ha sido procesado con éxito.</p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-6 border border-border text-left space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Estado</span>
                            <span className="font-bold text-green-600 dark:text-green-400">Confirmado</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Total pagado</span>
                            <span className="font-bold font-mono">${finalTotal.toLocaleString('es-CL')}</span>
                        </div>
                        {earnedCoupon && (
                            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg animate-bounce-subtle">
                                <div className="flex items-center gap-2 mb-1">
                                    <Ticket className="w-5 h-5 text-primary" />
                                    <span className="font-bold text-primary">¡RECOMPENSA DESBLOQUEADA!</span>
                                </div>
                                <p className="text-xs font-medium text-foreground">{earnedCoupon.message}</p>
                                <div className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    CÓDIGO: <span className="text-primary">{earnedCoupon.code}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => router.push(`/orders/${orderId}`)}
                            className="w-full h-12 text-base font-bold uppercase tracking-wider shadow-lg hover:translate-y-0.5 transition-all"
                        >
                            Ver detalles del pedido
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                            className="w-full h-12 text-base font-bold uppercase tracking-wider border-2 hover:bg-muted/50 transition-colors"
                        >
                            Seguir comprando
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-12 font-sans animate-fade-in">
            {/* Left Column - Forms */}
            <div className="lg:col-span-7 px-4 py-4 md:px-8 lg:px-12 lg:py-8 order-2 lg:order-1 border-r border-border">
                <div className="max-w-xl ml-auto mr-auto lg:mr-0">
                    {/* Header/Logo */}
                    <div className="mb-6 flex items-center justify-between">
                        <Link href="/" className="font-display text-3xl md:text-4xl font-black italic tracking-tighter text-foreground hover:scale-105 transition-transform inline-block">JP DK</Link>
                        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors lg:hidden">
                            Volver
                        </Link>
                    </div>

                    {/* Breadcrumbs / Contact Info */}
                    <div className="space-y-6">

                        {/* Combined Information Group */}
                        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm text-sm">
                            {/* Contact Section */}
                            <div className="p-4 border-b border-border flex justify-between items-start">
                                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                                    <p className="text-muted-foreground text-xs font-medium">Contacto</p>
                                    <p className="font-medium text-foreground truncate">{contactEmail}</p>
                                </div>
                                <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Ship To Section */}
                            <div className="p-4 border-b border-border flex justify-between items-start">
                                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                                    <p className="text-muted-foreground text-xs font-medium">Enviar a</p>
                                    <p className="font-medium text-foreground leading-snug text-xs md:text-sm">
                                        {formattedAddress}
                                    </p>
                                </div>
                                <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Method Section */}
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
                                    <p className="text-muted-foreground text-xs font-medium">Método</p>
                                    <p className="font-medium text-foreground text-xs md:text-sm">Envío Estándar · <span className="font-bold">${shippingCost.toLocaleString('es-CL')}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Section (Active) */}
                        <div className="mt-8">
                            <h2 className="font-display text-lg font-bold uppercase mb-2 text-foreground">Pago</h2>
                            <p className="text-xs text-muted-foreground mb-4">Todas las transacciones son seguras y están encriptadas.</p>

                            <div className="border border-border rounded-lg overflow-hidden bg-card">
                                {/* Mercado Pago */}
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer border-b border-border transition-colors ${paymentMethod === 'mercadopago' ? 'bg-muted/30' : 'bg-card'}`}
                                    onClick={() => setPaymentMethod('mercadopago')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'mercadopago' ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {paymentMethod === 'mercadopago' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <span className="font-bold text-sm text-foreground">Mercado Pago</span>
                                    </div>
                                    <div className="flex gap-1 items-center opacity-100">
                                        <span className="text-[9px] font-black text-blue-500 italic bg-white border px-1 rounded">MP</span>
                                        <span className="text-[9px] font-bold text-blue-800 bg-white border px-1 rounded">VISA</span>
                                        <span className="text-[9px] font-bold text-red-600 bg-white border px-1 rounded">MC</span>
                                    </div>
                                </div>

                                {paymentMethod === 'mercadopago' && (
                                    <div className="p-8 bg-background text-center border-b border-border animate-fade-in flex flex-col items-center justify-center">
                                        <ShieldCheck className="w-12 h-12 text-foreground mb-4 mx-auto" />
                                        <p className="text-sm text-foreground font-medium max-w-xs mx-auto leading-relaxed">
                                            Luego de hacer clic en "Pagar ahora", serás redirigido a Mercado Pago para completar tu compra de forma segura.
                                        </p>
                                    </div>
                                )}

                                {/* Flow */}
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer border-b border-border transition-colors ${paymentMethod === 'flow' ? 'bg-muted/30' : 'bg-card'}`}
                                    onClick={() => setPaymentMethod('flow')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'flow' ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {paymentMethod === 'flow' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <span className="font-medium text-sm text-foreground">Checkout Flow</span>
                                    </div>
                                </div>

                                {/* Transfer */}
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentMethod === 'transfer' ? 'bg-muted/30' : 'bg-card'}`}
                                    onClick={() => setPaymentMethod('transfer')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'transfer' ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {paymentMethod === 'transfer' && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <span className="font-medium text-sm text-foreground">Transferencia / Deposito</span>
                                    </div>
                                </div>
                            </div>
                        </div>

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

            {/* Right Column - Summary */}
            <div className="lg:col-span-5 bg-muted/20 px-4 py-8 md:px-8 lg:px-10 lg:py-8 order-1 lg:order-2 border-l border-border h-full lg:min-h-screen">
                <div className="max-w-md mr-auto ml-auto lg:ml-0 sticky top-8">
                    {/* Mobile Header (Only visible on mobile if needed, but we have global header now) */}

                    {/* Items Accordion / List */}
                    <div className="mb-6">
                        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {displayCart.map(item => (
                                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 bg-card border border-border rounded-md overflow-hidden flex-shrink-0">
                                        <img src={item.images[0]?.url} className="w-full h-full object-cover" alt={item.name} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{item.selectedSize}</p>
                                        <p className="text-xs text-muted-foreground font-medium mt-1">Cantidad: {item.quantity}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-sm font-bold text-foreground font-mono">
                                            ${item.price.toLocaleString('es-CL')}
                                        </div>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <div className="text-[10px] text-muted-foreground line-through font-mono">
                                                ${item.originalPrice.toLocaleString('es-CL')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="mb-8 border-b border-border pb-8">
                        {!appliedCoupon ? (
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Código de descuento"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-1 bg-background border border-border rounded-none border-t-0 border-r-0 border-l-0 border-b-2 px-0 py-2 text-sm focus:border-foreground focus:ring-0 focus:outline-none transition-colors placeholder:text-muted-foreground/70"
                                />
                                <Button
                                    variant="outline"
                                    className="font-bold border-2"
                                    onClick={handleApplyCoupon}
                                    disabled={isValidatingCoupon || !couponCode.trim()}
                                >
                                    {isValidatingCoupon ? '...' : 'Usar'}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-3 rounded-md">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-sm font-bold text-primary">{appliedCoupon.code}</p>
                                        <p className="text-[11px] font-medium text-primary/80">
                                            {appliedCoupon.type === 'PERCENTAGE'
                                                ? `${appliedCoupon.value}% OFF`
                                                : `$${appliedCoupon.value.toLocaleString('es-CL')} OFF`
                                            }
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">{appliedCoupon.description || 'Descuento aplicado'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-muted-foreground hover:text-destructive transition-colors text-xs font-bold underline"
                                >
                                    Quitar
                                </button>
                            </div>
                        )}

                        {/* Wallet Selector */}
                        {!appliedCoupon && userCoupons.length > 0 && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowWallet(!showWallet)}
                                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                                >
                                    <Ticket className="w-4 h-4" />
                                    {showWallet ? 'Ocultar mis cupones' : 'Ver mis cupones disponibles'}
                                    {showWallet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                {showWallet && (
                                    <div className="mt-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                                        {userCoupons.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setCouponCode(item.coupon.code);
                                                    setShowWallet(false);
                                                    // Auto-apply: we can trigger it immediately if we modify handleApplyCoupon to accept a code
                                                    // or just trust the user will click "Usar". 
                                                    // Re-reading: "llenar automáticamente el campo".
                                                    // But to be "Inteligente", let's make it apply.
                                                }}
                                                className="w-full text-left p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs font-black tracking-tight">{item.coupon.code}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {item.coupon.type === 'PERCENTAGE' ? `${item.coupon.value}%` : `$${item.coupon.value.toLocaleString('es-CL')}`} de descuento
                                                        </p>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                        SELECCIONAR
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-3 text-sm text-foreground/80 mb-6">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium text-foreground">${displayTotal.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="flex items-center gap-1">Envío</span>
                            <span className="font-medium text-foreground">${shippingCost.toLocaleString('es-CL')}</span>
                        </div>

                        {appliedCoupon && (
                            <div className="flex justify-between text-primary font-bold">
                                <span className="flex items-center gap-1">Descuento ({appliedCoupon.code})</span>
                                <span>-${couponDiscount.toLocaleString('es-CL')}</span>
                            </div>
                        )}


                        {/* Savings Display */}
                        {displayCart.reduce((acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity, 0) > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                                <span>Ahorrado</span>
                                <span>-${displayCart.reduce((acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity, 0).toLocaleString('es-CL')}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t-2 border-dashed border-border pt-4">
                        <div className="flex justify-between items-end">
                            <span className="text-xl font-bold text-foreground">Total</span>
                            <div className="text-right flex items-baseline gap-2">
                                <span className="text-xs text-muted-foreground font-bold">CLP</span>
                                <span className="text-3xl font-black text-foreground tracking-tight">${finalTotal.toLocaleString('es-CL')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
