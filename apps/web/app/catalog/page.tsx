'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CatalogPageClient from '@/components/store/catalog/CatalogPageClient';

export default function CatalogPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            }
        >
            <CatalogPageClient />
        </Suspense>
    );
}
