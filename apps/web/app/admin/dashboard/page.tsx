'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../../src/components/ui/Button';
import { ShoppingBag, Package, Users } from 'lucide-react';
import { fetchProducts } from '../../../src/services/productService';
import { Product } from '../../../src/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const router = useRouter();

    // Stats Data (Mock)
    const stats = {
        orders: 156,
        products: products.length || 48,
        customers: 1205
    };

    // Orders Data (Mock)
    const orders = [
        { id: '#ORD-001', date: 'Hace 2 horas', total: 15990, status: 'Entregado' },
        { id: '#ORD-002', date: 'Hace 5 horas', total: 45990, status: 'Enviado' },
        { id: '#ORD-003', date: 'Hace 1 día', total: 12990, status: 'Pendiente' },
    ];

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await fetchProducts({ isPublished: 'all' });
            setProducts(data);
        } catch (error) {
            console.error('Error loading products for stats', error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(price);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1">Visión general de tu tienda y rendimiento</p>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                    Descargar Reporte
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<ShoppingBag className="w-6 h-6" />}
                    label="Pedidos"
                    value={stats.orders}
                    trend="+5%"
                    trendUp={true}
                />
                <StatCard
                    icon={<Package className="w-6 h-6" />}
                    label="Productos"
                    value={stats.products}
                    trend="0%"
                    trendUp={null}
                />
                <StatCard
                    icon={<Users className="w-6 h-6" />}
                    label="Clientes"
                    value={stats.customers}
                    trend="+24%"
                    trendUp={true}
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card rounded shadow-sm border border-border p-6">
                    <h3 className="font-display text-lg font-bold uppercase mb-6 text-foreground">Últimos Pedidos</h3>
                    <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => (
                            <div key={order.id} className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-bold text-sm text-foreground">{order.id}</p>
                                    <p className="text-xs text-muted-foreground">{order.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-foreground">{formatPrice(order.total)}</p>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${order.status === 'Entregado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        order.status === 'Enviado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-primary text-primary-foreground rounded shadow-sm p-6 relative overflow-hidden border border-border">
                    <div className="relative z-10">
                        <h3 className="font-display text-lg font-bold uppercase mb-2">JP DK GANG</h3>
                        <p className="text-primary-foreground/80 text-sm mb-6">Tu inventario de verano se está agotando más rápido de lo usual. Considera reponer stock de poleras gráficas.</p>
                        <Link href="/admin/products" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-background text-foreground border-none hover:bg-muted w-full sm:w-auto font-bold">
                            Ver Inventario
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 blur-3xl opacity-20 rounded-full transform translate-x-10 -translate-y-10"></div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ icon, label, value, trend, trendUp }: any) => (
    <div className="bg-card p-6 rounded shadow-sm border border-border group hover:border-foreground/20 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <span className="bg-muted p-2 rounded-lg text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                {icon}
            </span>
            {trend && (
                <span className={`${trendUp === true ? 'text-green-600' : trendUp === false ? 'text-red-600' : 'text-muted-foreground'} text-xs font-bold`}>
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
        <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
);
