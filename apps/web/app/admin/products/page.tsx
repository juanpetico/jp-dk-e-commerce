import React, { Suspense } from 'react';
import { fetchProducts } from '../../../src/services/productService';
import { ProductsClientManager } from '../../../src/components/admin/products/ProductsClientManager';
import ProductsTable from '../../../src/components/admin/products/ProductsTable';
import ProductsPageSkeleton from '../../../src/components/admin/products/ProductsPage.skeleton';

async function ProductsList() {
    const products = await fetchProducts({ isPublished: 'all' });

    return (
        <ProductsClientManager>
            <ProductsTable products={products} />
        </ProductsClientManager>
    );
}

export default function ProductsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <Suspense fallback={<ProductsPageSkeleton />}>
                <ProductsList />
            </Suspense>
        </div>
    );
}
