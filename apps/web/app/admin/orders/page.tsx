'use client';

import React, { Suspense } from 'react';
import OrdersPageClient from '@/components/admin/orders/OrdersPageClient';

export default function OrdersPage() {
    return (
        <Suspense>
            <OrdersPageClient />
        </Suspense>
    );
}
