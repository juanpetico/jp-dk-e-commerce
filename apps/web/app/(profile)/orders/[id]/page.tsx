'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, redirect, useRouter } from 'next/navigation';
import { useUser } from '../../../../src/store/UserContext';
import { Button } from '../../../../src/components/ui/Button';
import { ArrowLeft, Check, ShoppingBag, FileText } from 'lucide-react';
import { Order } from '../../../../src/types';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const { user, isAuthenticated } = useUser();
    const router = useRouter();

    React.useEffect(() => {
        if (!isAuthenticated || (user === null && !isAuthenticated)) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    if (!user) {
        return null;
    }

    const order = user.orders?.find((o) => o.id === id);

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4 text-foreground">Pedido no encontrado</h1>
                <Link href="/orders" className="text-primary hover:underline">
                    Volver a mis pedidos
                </Link>
            </div>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-display text-2xl font-bold text-foreground">Pedido #{order.id}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                        Fecha de confirmación: {order.date} 2025 {/* Assuming year is not in date string based on mock */}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            // TODO: Implement PDF export functionality
                            alert('Funcionalidad de exportar PDF próximamente');
                        }}
                        className="gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Exportar PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                    >
                        Volver a comprar
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    {/* Status Card */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="text-green-600 dark:text-green-400">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-foreground">{order.status}</p>
                                <p className="text-xs text-muted-foreground">{order.date} 2025</p>
                            </div>
                        </div>
                    </div>

                    {/* Address & Contact Info Card */}
                    <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {/* Contact Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4 text-foreground">Información de contacto</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{order.shippingAddress?.name}</p>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            {/* Billing Address Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4 text-foreground">Dirección de facturación</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{order.billingAddress?.name}</p>
                                    <p>{order.billingAddress?.rut}</p>
                                    <p>{order.billingAddress?.street}</p>
                                    <p>{order.billingAddress?.zipCode} {order.billingAddress?.city}</p>
                                    <p>{order.billingAddress?.region}</p>
                                    <p>{order.billingAddress?.country}</p>
                                    <p>{order.billingAddress?.phone}</p>
                                </div>
                            </div>

                            {/* Shipping Address Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4 text-foreground">Dirección de envío</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{order.shippingAddress?.name}</p>
                                    <p>{order.shippingAddress?.rut}</p>
                                    <p>{order.shippingAddress?.street}</p>
                                    <p>{order.shippingAddress?.zipCode} {order.shippingAddress?.city}</p>
                                    <p>{order.shippingAddress?.region}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                    <p>{order.shippingAddress?.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Method */}
                        <div>
                            <h3 className="font-bold text-sm mb-4 text-foreground">Método de envío</h3>
                            <p className="text-sm text-muted-foreground">
                                {order.shippingMethod || 'Estándar'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Product List & Totals */}
                <div className="lg:w-[400px]">
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        {/* Product List */}
                        <div className="space-y-6 mb-8 border-b border-border pb-8">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                                        <img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-0 right-0 bg-foreground text-background text-[10px] w-5 h-5 flex items-center justify-center rounded-bl font-bold">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display font-medium text-sm text-foreground">{item.product.name}</h4>
                                        <p className="text-xs text-muted-foreground">{item.size}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm text-foreground">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-3 pb-6 border-b border-border mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Envío</span>
                                <span className="text-foreground">{formatPrice(order.shippingCost)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-lg font-bold text-foreground">Total</span>
                            <div className="text-right">
                                <span className="text-xs text-muted-foreground mr-2">CLP</span>
                                <span className="text-xl font-bold text-foreground">{formatPrice(order.total).replace('$', '')}</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Incluye {formatPrice(order.taxes).replace('$', '')} $ de impuestos
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
