'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import { Order } from '@/types';
import { useCustomerDrawer } from '../useCustomerDrawer';
import { DrawerTabs } from './components/DrawerTabs';
import { DrawerHeader } from './components/DrawerHeader';
import { DrawerStats } from './components/DrawerStats';
import { AddressesSection } from './sections/AddressesSection';
import { CouponsSection } from './sections/CouponsSection';
import { OrdersSection } from './sections/OrdersSection';
import { CustomerDrawerProps, DrawerTab } from './types';

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
                            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l-2 border-foreground/20 bg-background shadow-2xl"
                        >
                            <DrawerHeader customer={customer} loading={loading} onClose={onClose} />

                            {customer && (
                                <DrawerStats
                                    customer={customer}
                                    orders={orders}
                                    activeCouponsCount={activeCoupons.length}
                                />
                            )}

                            <DrawerTabs activeTab={activeTab} onChange={setActiveTab} />

                            <ScrollArea className="flex-1 px-5 py-4">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-sm">Cargando informacion...</span>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
                                        <AlertCircle className="h-6 w-6" />
                                        <p className="text-center text-sm">{error}</p>
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'ORDERS' && (
                                            <OrdersSection orders={orders} onSelectOrder={setSelectedOrder} />
                                        )}
                                        {activeTab === 'COUPONS' && (
                                            <CouponsSection activeCoupons={activeCoupons} usedCoupons={usedCoupons} />
                                        )}
                                        {activeTab === 'ADDRESSES' && (
                                            <AddressesSection addresses={addresses} />
                                        )}
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
