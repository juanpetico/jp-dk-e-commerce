"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../store/CartContext';
import { Button } from '../ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    X,
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    Truck,
    Pencil,
    Ticket,
    ChevronDown,
    Check
} from 'lucide-react';
import { CartItem, Coupon } from '../../types';
import { fetchMyCoupons } from '../../services/couponService';
import { validateCoupon } from '../../services/orderService';
import { useUser } from '../../store/UserContext';
import { toast } from 'sonner';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { useShopConfigPublic } from '@/hooks/useShopConfigPublic';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'STD'];

const CartDrawer: React.FC = () => {
    const { isOpen, toggleCart, cart, removeFromCart, updateQuantity, addToCart, cartTotal, appliedCoupon, setAppliedCoupon } = useCart();
    const { isAuthenticated } = useUser();

    // State for Discount
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [userCoupons, setUserCoupons] = useState<any[]>([]);
    const [showWallet, setShowWallet] = useState(false);

    const { freeShippingThreshold } = useShopConfigPublic();
    const freeShippingEnabled = freeShippingThreshold > 0;
    const remainingForFreeShipping = freeShippingEnabled
        ? Math.max(0, freeShippingThreshold - cartTotal)
        : 0;
    const progressPercentage = freeShippingEnabled
        ? Math.min(100, (cartTotal / freeShippingThreshold) * 100)
        : 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (isAuthenticated) {
                const loadCoupons = async () => {
                    try {
                        const coupons = await fetchMyCoupons();
                        setUserCoupons(coupons);
                    } catch (error) {
                        console.error("Failed to load coupons", error);
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
    }, [isOpen]);

    const handleSizeChange = (item: CartItem, newSize: string) => {
        if (newSize !== item.selectedSize) {
            removeFromCart(item.id, item.selectedSize);
            addToCart(item, newSize);
        }
    };

    const handleApplyCoupon = async () => {
        if (!discountCode.trim()) return;

        setIsValidating(true);
        try {
            const coupon = await validateCoupon(discountCode, cartTotal);
            setAppliedCoupon(coupon);
            toast.success(`Cupón "${coupon.code}" aplicado`);
            setShowDiscountInput(false);
            setDiscountCode('');
        } catch (error: any) {
            toast.error(error.message || "Cupón inválido");
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    const couponDiscount = appliedCoupon
        ? (appliedCoupon.type === 'PERCENTAGE'
            ? Math.round(cartTotal * (appliedCoupon.value / 100))
            : Math.min(appliedCoupon.value, cartTotal))
        : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={toggleCart}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col text-foreground"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-background">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="flex items-center justify-center w-7 h-7 rounded bg-muted text-foreground text-xs font-bold">
                                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            </div>
                            <button onClick={toggleCart} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Free Shipping Progress */}
                        {freeShippingEnabled && (
                        <div className="px-6 pt-4 pb-2">
                            {remainingForFreeShipping > 0 ? (
                                <>
                                    <p className="text-sm text-center mb-2">
                                        Compra <span className="font-bold">{formatPrice(remainingForFreeShipping)}</span> más para tener <span className="font-bold">envío GRATIS</span>
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
                                        ¡Tienes envío gratis!
                                    </span>
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden mt-2 border border-zinc-200 dark:border-zinc-700">
                                        <div className="bg-green-600 dark:bg-green-400 h-full w-full" />
                                    </div>
                                </div>
                            )}
                        </div>
                        )}

                        {/* Cart Items */}
                        <ScrollArea className="flex-1 bg-background">
                            <div className="p-6 space-y-8">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[50vh] text-center text-muted-foreground">
                                        <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="text-lg font-medium mb-1">Tu carrito está vacío</p>
                                        <Button variant="outline" className="mt-6" onClick={toggleCart}>
                                            Ver productos
                                        </Button>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 relative group">
                                            {/* Product Image */}
                                            <div className="w-24 h-28 flex-shrink-0 bg-muted overflow-hidden relative rounded-sm border border-gray-300">
                                                <img src={item.images[0]?.url || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-sm uppercase leading-tight pr-6">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Size & Edit */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-medium text-muted-foreground">{item.selectedSize}</span>

                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="text-muted-foreground hover:text-foreground transition-colors outline-none p-1 hover:bg-muted rounded">
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0 w-40" align="start">
                                                            <Command>
                                                                <CommandList>
                                                                    <CommandEmpty>No hay tallas.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {(item.variants?.length ? item.variants.map(v => v.size) : AVAILABLE_SIZES).map((size) => (
                                                                            <CommandItem
                                                                                key={size}
                                                                                value={size}
                                                                                onSelect={() => handleSizeChange(item, size)}
                                                                                className="text-xs cursor-pointer"
                                                                            >
                                                                                <div className={cn(
                                                                                    "mr-2 flex h-3 w-3 items-center justify-center rounded-sm border border-primary",
                                                                                    item.selectedSize === size
                                                                                        ? "bg-primary text-primary-foreground"
                                                                                        : "opacity-50 [&_svg]:invisible"
                                                                                )}>
                                                                                    <Check className="h-3 w-3" />
                                                                                </div>
                                                                                {size}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                {/* Quantity & Price */}
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center border border-input rounded overflow-hidden h-8">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                                            className="w-8 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 h-full flex items-center justify-center text-sm font-medium bg-transparent">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                                            disabled={item.quantity >= (item.variants?.find(v => v.size === item.selectedSize)?.stock || 0)}
                                                            className="w-8 h-full flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <p className="text-xs text-muted-foreground line-through 
                                                    text-red-800">{formatPrice(item.originalPrice * item.quantity)}</p>
                                                        )}
                                                        <p className="font-bold text-base">{formatPrice(item.price * item.quantity)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="border-t border-border bg-background border-gray-300">
                                {/* Discount Code */}
                                <div className="border-b border-gray-300">
                                    {appliedCoupon ? (
                                        <div className="p-4 bg-primary/5 border-b border-gray-300 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="w-4 h-4 text-primary" />
                                                <div>
                                                    <p className="text-xs font-bold text-primary uppercase">{appliedCoupon.code}</p>
                                                    <p className="text-[10px] text-muted-foreground">Descuento aplicado</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="text-[10px] font-bold text-destructive hover:underline uppercase"
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    ) : !showDiscountInput ? (
                                        <button
                                            onClick={() => setShowDiscountInput(true)}
                                            className="w-full flex items-center justify-center gap-2 py-4 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors text-sm font-medium"
                                        >
                                            <Ticket className="w-4 h-4" />
                                            Ingresar descuento
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-muted/20 animate-in slide-in-from-top-2 border-gray-300">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="CÓDIGO"
                                                    className="flex-1 border border-input rounded px-3 py-2 text-xs font-bold uppercase bg-background"
                                                    value={discountCode}
                                                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidating || !discountCode.trim()}
                                                    className="bg-black text-white dark:bg-white dark:text-black font-bold h-9"
                                                >
                                                    {isValidating ? '...' : 'OK'}
                                                </Button>
                                            </div>

                                            {/* Wallet Toggle */}
                                            {isAuthenticated && userCoupons.length > 0 && (
                                                <div className="mt-3">
                                                    <button
                                                        onClick={() => setShowWallet(!showWallet)}
                                                        className="text-[10px] font-bold text-primary hover:underline uppercase flex items-center gap-1"
                                                    >
                                                        {showWallet ? 'Ocultar mis cupones' : 'Ver mis cupones'}
                                                        <ChevronDown className={cn("w-3 h-3 transition-transform", showWallet && "rotate-180")} />
                                                    </button>
                                                    {showWallet && (
                                                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                                            {userCoupons.map((item) => (
                                                                <button
                                                                    key={item.id}
                                                                    onClick={() => setDiscountCode(item.coupon.code)}
                                                                    className="w-full text-left p-2 border border-border rounded hover:bg-muted transition-colors text-[10px]"
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-bold">{item.coupon.code}</span>
                                                                        <span className="text-muted-foreground">
                                                                            {item.coupon.type === 'PERCENTAGE' ? `${item.coupon.value}%` : `$${item.coupon.value.toLocaleString('es-CL')}`}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setShowDiscountInput(false)}
                                                className="text-[10px] text-muted-foreground mt-3 hover:underline uppercase font-bold"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 space-y-4 border-t-red-600">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Descuento</span>
                                        <span className="text-green-600 dark:text-green-400 font-bold">
                                            -{formatPrice(couponDiscount)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-bold">Total</span>
                                        <div className="text-right">
                                            <span className="text-xl font-bold">{formatPrice(cartTotal - couponDiscount)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            toggleCart();
                                        }}
                                        className="w-full bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black h-12 text-base font-bold uppercase tracking-wide"
                                        asChild
                                    >
                                        <Link href="/checkout" onClick={toggleCart} className="w-full h-full flex items-center justify-center">Continuar</Link>
                                    </Button>

                                    <button
                                        onClick={toggleCart}
                                        className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors pb-2"
                                    >
                                        Continuar comprando
                                    </button>

                                    {/* Payment Icons */}
                                    <div className="flex flex-col gap-2 pt-2">
                                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-bold">Métodos de pago aceptados</p>
                                        <div className="flex justify-center gap-4 opacity-100 items-center">
                                            {/* Webpay */}
                                            <div className="flex flex-col items-center gap-1 group cursor-default">
                                                <div className="w-10 h-7 rounded border border-gray-300 bg-white flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors overflow-hidden">
                                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3SeRfess0YS2dilDTs0gGGs13TiiPdpwlvQ&s" alt="Webpay" className="w-full h-full object-contain p-0.5" />
                                                </div>
                                            </div>
                                            {/* Mercado Pago */}
                                            <div className="flex flex-col items-center gap-1 group cursor-default">
                                                <div className="w-10 h-7 rounded border border-gray-300 bg-white flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors overflow-hidden">
                                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj7WLHnmXccsnJareD8U_7cMvz5Q7-cFserg&s" alt="Mercado Pago" className="w-full h-full object-contain p-0.5" />
                                                </div>
                                            </div>
                                            {/* PayPal */}
                                            <div className="flex flex-col items-center gap-1 group cursor-default">
                                                <div className="w-10 h-7 rounded border border-gray-300 bg-white flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors overflow-hidden">
                                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgtdXq-EaaZT-YhPFt9-k8W-mryjwl6_znkw&s" alt="PayPal" className="w-full h-full object-contain p-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
