'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchOrderById } from '@/services/orderService';
import { generateOrderPDF } from '@/services/orderReportService';
import { useUser } from '@/store/UserContext';
import { Order } from '@/types';
import OrderDetailsContactCard from './OrderDetailsPage.contact-card';
import OrderDetailsPageHeader from './OrderDetailsPage.header';
import OrderDetailsPageNotFound from './OrderDetailsPage.not-found';
import OrderDetailsPageSkeleton from './OrderDetailsPage.skeleton';
import OrderDetailsSummaryCard from './OrderDetailsPage.summary-card';
import { getOrderBillingSnapshot, getOrderShippingSnapshot } from './OrderDetailsPage.utils';

export default function OrderDetailsPageClient() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const router = useRouter();
    const { user, isAuthenticated } = useUser();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            const foundInUser = user?.orders?.find((userOrder) => userOrder.id === id);

            if (foundInUser) {
                setOrder(foundInUser);
                setLoading(false);
                return;
            }

            try {
                const data = await fetchOrderById(id);
                setOrder(data || null);
            } catch (error) {
                console.error('Failed to fetch order:', error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        if (!isAuthenticated && user === null && !loading) {
            router.push('/login');
            return;
        }

        if (isAuthenticated || user) {
            void loadOrder();
        }
    }, [id, isAuthenticated, loading, router, user]);

    if (loading) {
        return <OrderDetailsPageSkeleton />;
    }

    if (!order) {
        return <OrderDetailsPageNotFound />;
    }

    const shippingSnapshot = getOrderShippingSnapshot(order);
    const billingSnapshot = getOrderBillingSnapshot(order);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <OrderDetailsPageHeader
                order={order}
                onBackToHome={() => router.push('/')}
                onExportPdf={() => generateOrderPDF(order)}
            />

            <div className="flex flex-col lg:flex-row gap-8">
                <OrderDetailsContactCard
                    shipping={shippingSnapshot}
                    billing={billingSnapshot}
                    email={user?.email}
                    shippingMethod={order.shippingMethod}
                />

                <OrderDetailsSummaryCard order={order} />
            </div>
        </div>
    );
}
