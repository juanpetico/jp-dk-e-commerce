'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    X,
    Loader2,
    ShoppingBag,
    Ticket,
    MapPin,
    Package,
    AlertCircle,
    ExternalLink,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Order, Address } from '@/types';
import { UserCouponRecord } from '@/services/couponService';
import { getOrderStatusColor, ORDER_STATUS_LABELS } from '@/services/orderService';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import { useCustomerDrawer } from './useCustomerDrawer';

type DrawerTab = 'ORDERS' | 'COUPONS' | 'ADDRESSES';

const TABS: { key: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { key: 'ORDERS', label: 'Pedidos', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { key: 'COUPONS', label: 'Cupones', icon: <Ticket className="w-3.5 h-3.5" /> },
    { key: 'ADDRESSES', label: 'Direcciones', icon: <MapPin className="w-3.5 h-3.5" /> },
];

const formatCLP = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(d);
};

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border p-8 text-center">
            <span className="text-muted-foreground">{icon}</span>
            <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
        </div>
    );
}

function OrdersList({ orders, onSelectOrder }: { orders: Order[]; onSelectOrder: (o: Order) => void }) {
    if (orders.length === 0) {
        return (
            <EmptyState
                icon={<ShoppingBag className="w-8 h-8" />}
                title="Sin pedidos"
                description="Este cliente aún no ha realizado ningún pedido."
            />
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {orders.map((order) => (
                <button
                    key={order.id}
                    type="button"
                    onClick={() => onSelectOrder(order)}
                    className="w-full text-left rounded-md border border-border p-3 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-xs font-mono font-bold text-foreground">
                                    #{order.id.slice(-8).toUpperCase()}
                                </p>
                                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(order.date ?? order.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span
                            className={cn(
                                'text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider',
                                getOrderStatusColor(order.status)
                            )}
                        >
                            {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-sm font-mono font-bold text-foreground whitespace-nowrap">
                            {formatCLP(order.total)}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}

function CouponsList({
    activeCoupons,
    usedCoupons,
}: {
    activeCoupons: UserCouponRecord[];
    usedCoupons: UserCouponRecord[];
}) {
    if (activeCoupons.length === 0 && usedCoupons.length === 0) {
        return (
            <EmptyState
                icon={<Ticket className="w-8 h-8" />}
                title="Sin cupones"
                description="Este cliente no tiene cupones asignados."
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {activeCoupons.length > 0 && (
                <section>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Activos ({activeCoupons.length})
                    </p>
                    <div className="flex flex-col gap-2">
                        {activeCoupons.map((record) => (
                            <CouponCard key={record.id} record={record} variant="active" />
                        ))}
                    </div>
                </section>
            )}

            {usedCoupons.length > 0 && (
                <section>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Usados ({usedCoupons.length})
                    </p>
                    <div className="flex flex-col gap-2">
                        {usedCoupons.map((record) => (
                            <CouponCard key={record.id} record={record} variant="used" />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function CouponCard({ record, variant }: { record: UserCouponRecord; variant: 'active' | 'used' }) {
    const { coupon } = record;
    return (
        <div
            className={cn(
                'rounded-md border p-3 flex items-start justify-between gap-3',
                variant === 'active' ? 'border-border' : 'border-border opacity-60'
            )}
        >
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-foreground">{coupon.code}</span>
                    <span
                        className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase',
                            variant === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                        )}
                    >
                        {variant === 'active' ? 'disponible' : 'usado'}
                    </span>
                </div>
                {coupon.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{coupon.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                    Asignado {formatDate(record.assignedAt)}
                </p>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-mono font-bold text-foreground">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCLP(coupon.value)}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">
                    {coupon.type === 'PERCENTAGE' ? 'descuento' : 'fijo'}
                </p>
            </div>
        </div>
    );
}

function AddressesList({ addresses }: { addresses: Address[] }) {
    if (addresses.length === 0) {
        return (
            <EmptyState
                icon={<MapPin className="w-8 h-8" />}
                title="Sin direcciones"
                description="Este cliente no tiene direcciones guardadas."
            />
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {addresses.map((addr) => (
                <div key={addr.id} className="rounded-md border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-foreground">{addr.name}</p>
                        {addr.isDefault && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-foreground text-background uppercase shrink-0">
                                Por defecto
                            </span>
                        )}
                    </div>
                    {addr.rut && (
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-semibold text-foreground">RUT:</span> {addr.rut}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{addr.street}</p>
                    <p className="text-xs text-muted-foreground">
                        {addr.comuna}, {addr.region}
                    </p>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                </div>
            ))}
        </div>
    );
}

interface CustomerDrawerProps {
    userId: string | null;
    open: boolean;
    onClose: () => void;
}

export default function CustomerDrawer({ userId, open, onClose }: CustomerDrawerProps) {
    const [activeTab, setActiveTab] = useState<DrawerTab>('ORDERS');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const routePrefix = pathname.startsWith('/superadmin') ? '/superadmin' : '/admin';

    const { customer, orders, addresses, activeCoupons, usedCoupons, loading, error } =
        useCustomerDrawer({ userId, open });

    const handleRedirectToOrder = (order: Order) => {
        setSelectedOrder(null);
        onClose();
        router.push(`${routePrefix}/orders?orderId=${order.id}`);
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
                            onClick={onClose}
                        />

                        <motion.aside
                            key="panel"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-background border-l-2 border-foreground/20 shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between border-b border-border p-5 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-display font-bold text-sm uppercase shrink-0">
                                        {customer ? (customer.name || customer.email).charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h2 className="font-display text-xl font-black uppercase tracking-tight text-foreground leading-tight">
                                            {loading ? 'Cargando...' : customer?.name || 'Sin nombre'}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">{customer?.email ?? ''}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Stats strip */}
                            {customer && (
                                <div className="flex items-center divide-x divide-border border-b border-border shrink-0">
                                    <div className="flex-1 px-5 py-3 text-center">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Pedidos</p>
                                        <p className="font-display font-black text-lg text-foreground">{orders.length}</p>
                                    </div>
                                    <div className="flex-1 px-5 py-3 text-center">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total gastado</p>
                                        <p className="font-display font-black text-lg text-foreground">
                                            {formatCLP(customer.totalSpent ?? orders.reduce((s, o) => s + o.total, 0))}
                                        </p>
                                    </div>
                                    <div className="flex-1 px-5 py-3 text-center">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Cupones</p>
                                        <p className="font-display font-black text-lg text-foreground">
                                            {activeCoupons.length}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="flex gap-2 px-5 pt-4 pb-3 border-b border-border shrink-0">
                                {TABS.map((tab) => (
                                    <Button
                                        key={tab.key}
                                        type="button"
                                        size="sm"
                                        variant={activeTab === tab.key ? 'default' : 'outline'}
                                        onClick={() => setActiveTab(tab.key)}
                                        className="flex items-center gap-1.5"
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </Button>
                                ))}
                            </div>

                            {/* Content */}
                            <ScrollArea className="flex-1 px-5 py-4">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm">Cargando información...</span>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
                                        <AlertCircle className="w-6 h-6" />
                                        <p className="text-sm text-center">{error}</p>
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'ORDERS' && (
                                            <OrdersList orders={orders} onSelectOrder={setSelectedOrder} />
                                        )}
                                        {activeTab === 'COUPONS' && (
                                            <CouponsList activeCoupons={activeCoupons} usedCoupons={usedCoupons} />
                                        )}
                                        {activeTab === 'ADDRESSES' && <AddressesList addresses={addresses} />}
                                    </>
                                )}
                            </ScrollArea>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {selectedOrder && (
                <OrderDetailModal
                    isOpen={true}
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                    onRedirect={() => handleRedirectToOrder(selectedOrder)}
                />
            )}
        </>
    );
}
