'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, redirect, useRouter } from 'next/navigation';
import { useUser } from '../../../../src/store/UserContext';
import Button from '../../../../src/components/ui/Button';
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react';
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
                <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
                <Link href="/orders" className="text-red-600 underline">
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
                        <Link href="/orders" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-display text-2xl font-bold">Pedido #{order.id}</h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                        Fecha de confirmación: {order.date} 2025 {/* Assuming year is not in date string based on mock */}
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="rounded border-gray-200 dark:border-gray-700 text-red-600 hover:text-red-700 hover:border-red-600 hover:bg-transparent normal-case font-bold"
                    onClick={() => router.push('/')}
                >
                    Volver a comprar
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="text-green-600">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-black dark:text-white">{order.status}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.date} 2025</p>
                            </div>
                        </div>
                    </div>

                    {/* Address & Contact Info Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Contact Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4">Información de contacto</h3>
                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <p>{order.shippingAddress?.name}</p>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            {/* Billing Address Layout */}
                            <div>
                                <h3 className="font-bold text-sm mb-4">Dirección de facturación</h3>
                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
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
                                <h3 className="font-bold text-sm mb-4">Dirección de envío</h3>
                                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <p>{order.shippingAddress?.name}</p>
                                    <p>{order.shippingAddress?.rut}</p>
                                    <p>{order.shippingAddress?.street}</p>
                                    <p>{order.shippingAddress?.zipCode} {order.shippingAddress?.city}</p>
                                    <p>{order.shippingAddress?.region}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                    <p>{order.shippingAddress?.phone}</p>
                                </div>
                            </div>

                            {/* Empty column to match grid layout of design which seems to have 2 columns but row wrapping */}
                            <div></div>
                        </div>

                        {/* Shipping Method */}
                        <div>
                            <h3 className="font-bold text-sm mb-4">Método de envío</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {order.shippingMethod || 'Estándar'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Product List & Totals */}
                <div className="lg:w-[400px]">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                        {/* Product List */}
                        <div className="space-y-6 mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-16 h-16 bg-black rounded flex-shrink-0 overflow-hidden">
                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-0 right-0 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl font-bold">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display font-medium text-sm">{item.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.selectedSize}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-700 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Envío</span>
                                <span>{formatPrice(order.shippingCost)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-lg font-bold">Total</span>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">CLP</span>
                                <span className="text-xl font-bold">{formatPrice(order.total).replace('$', '')}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Incluye {formatPrice(order.taxes).replace('$', '')} $ de impuestos
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
