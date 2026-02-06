'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, redirect, useRouter } from 'next/navigation';
import { useUser } from '../../../../src/store/UserContext';
import { Button } from '../../../../src/components/ui/Button';
import { ArrowLeft, Check, ShoppingBag, FileText } from 'lucide-react';
import { Order } from '../../../../src/types';
import { fetchOrderById } from '../../../../src/services/orderService';
import { generateOrderPDF } from '../../../../src/services/orderReportService';

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user, isAuthenticated } = useUser();
    const router = useRouter();
    const [order, setOrder] = React.useState<Order | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!isAuthenticated && user === null && !loading) {
            router.push('/login');
            return;
        }

        const loadOrder = async () => {
            if (!id) return;

            // 1. Try to find in user orders first (fastest)
            const foundInUser = user?.orders?.find((o) => o.id === id);

            if (foundInUser) {
                setOrder(foundInUser);
                setLoading(false);
                return;
            }

            // 2. Fallback to API direct fetch
            try {
                const data = await fetchOrderById(id);
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch order:", error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated || user) {
            loadOrder();
        }
    }, [id, user, isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <p className="text-muted-foreground animate-pulse">Cargando detalles del pedido...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4 text-foreground text-center">Pedido no encontrado</h1>
                <Link href="/orders" className="text-primary hover:underline transition-colors font-medium">
                    Volver a mis pedidos
                </Link>
            </div>
        );
    }

    // Snapshot Logic helpers
    const shipping = {
        name: order.shippingName || order.shippingAddress?.name || 'N/A',
        rut: order.shippingRut || order.shippingAddress?.rut || 'N/A',
        street: order.shippingStreet || order.shippingAddress?.street,
        comuna: order.shippingComuna || order.shippingAddress?.comuna,
        region: order.shippingRegion || order.shippingAddress?.region,
        zipCode: order.shippingZipCode || order.shippingAddress?.zipCode,
        phone: order.shippingPhone || order.shippingAddress?.phone || 'N/A',
        country: 'Chile',
    };

    const billing = {
        name: order.billingName || order.billingAddress?.name || 'N/A',
        rut: order.billingRut || order.billingAddress?.rut || 'N/A',
        street: order.billingStreet || order.billingAddress?.street,
        comuna: order.billingComuna || order.billingAddress?.comuna,
        region: order.billingRegion || order.billingAddress?.region,
        zipCode: order.billingZipCode || order.billingAddress?.zipCode,
        phone: order.billingPhone || order.billingAddress?.phone,
        country: 'Chile',
    };

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
                        Fecha de confirmación: {order.date}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => generateOrderPDF(order)}
                        className="gap-2 border-gray-300 hover:border-gray-400"
                    >
                        <FileText className="w-4 h-4" />
                        Exportar PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="border-gray-300 hover:border-gray-400"
                    >
                        Volver a comprar
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    {/* Status Card */}
                    <div className="bg-card border border-gray-300 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="text-green-600 dark:text-green-400">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-foreground">{order.status}</p>
                                <p className="text-xs text-muted-foreground">{order.date}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address & Contact Info Card */}
                    <div className="bg-card border border-gray-300 rounded-lg p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {/* Contact Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4 text-foreground">Información de contacto</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{shipping.name}</p>
                                    <p>{user?.email}</p>
                                </div>
                            </div>

                            {/* Billing Address Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4 text-foreground">Dirección de facturación</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{billing.name}</p>
                                    <p>{billing.rut}</p>
                                    <p>{billing.street}</p>
                                    <p>{billing.comuna}, {billing.region}</p>
                                    {billing.zipCode && <p>CP: {billing.zipCode}</p>}
                                    <p>{billing.country}</p>
                                    <p>{billing.phone}</p>
                                </div>
                            </div>

                            {/* Shipping Address Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4 text-foreground">Dirección de envío</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{shipping.name}</p>
                                    <p>{shipping.rut}</p>
                                    <p>{shipping.street}</p>
                                    <p>{shipping.comuna}, {shipping.region}</p>
                                    {shipping.zipCode && <p>CP: {shipping.zipCode}</p>}
                                    <p>{shipping.country}</p>
                                    <p>{shipping.phone}</p>
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
                    <div className="bg-card border border-gray-300 rounded-lg p-6 shadow-sm">
                        {/* Product List */}
                        <div className="space-y-6 mb-8 border-b border-gray-200 pb-8">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                                        <img src={item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display font-medium text-sm text-foreground">{item.product.name}</h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <p className="text-xs text-muted-foreground">{item.size}</p>
                                            <p className="text-xs font-bold text-foreground">Cantidad: {item.quantity}</p>
                                            {((item.product.originalPrice || item.product.price) - item.price) > 0 && (
                                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                                    Ahorraste {formatPrice(((item.product.originalPrice || item.product.price) - item.price) * item.quantity)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm text-foreground">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-3 pb-6 border-b border-gray-200 mb-6">
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
