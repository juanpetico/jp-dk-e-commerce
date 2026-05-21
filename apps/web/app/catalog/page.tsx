import { Suspense } from 'react';
import CatalogPageClient from '@/components/store/catalog/CatalogPageClient';
import CatalogPageSkeleton from '@/components/store/catalog/CatalogPage.skeleton';

export default function CatalogPage() {
    return (
        <Suspense fallback={<CatalogPageSkeleton />}>
            <CatalogPageClient />
        </Suspense>
    );
}
