import React, { Suspense } from 'react';
import { fetchProducts } from '../../../src/services/productService';
import { ProductsClientManager } from '../../../src/components/admin/products/ProductsClientManager';
import ProductsTable from '../../../src/components/admin/products/ProductsTable';
import AdminTableBodySkeleton from '@/components/admin/shared/AdminTableBodySkeleton';

// El admin siempre debe ver datos frescos: sin esto, la lista queda en el
// Full Route Cache y no refleja ediciones aunque sí persistan en la DB.
export const dynamic = 'force-dynamic';

async function ProductsData() {
    const products = await fetchProducts({ isPublished: 'all' });
    return <ProductsTable products={products} />;
}

export default function ProductsPage() {
    return (
        <div className="animate-fade-in">
            <ProductsClientManager>
                <Suspense fallback={<AdminTableBodySkeleton columns={7} />}>
                    <ProductsData />
                </Suspense>
            </ProductsClientManager>
        </div>
    );
}
