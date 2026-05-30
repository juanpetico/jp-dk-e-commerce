import { Suspense } from 'react';
import { Metadata } from 'next';
import CatalogPageClient from '@/components/store/catalog/CatalogPageClient';
import CatalogPageSkeleton from '@/components/store/catalog/CatalogPage.skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jpdk.cl';

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { category } = await searchParams;

    if (!category) {
        return {
            title: 'Catálogo | JP DK Streetwear',
            description: 'Explora toda la colección de streetwear JP DK.',
            alternates: { canonical: `${SITE_URL}/catalog` },
        };
    }

    try {
        const res = await fetch(`${API_URL}/categories/slug/${category}?isPublished=true`, {
            next: { revalidate: 60 },
        });
        if (res.ok) {
            const json = await res.json();
            const cat = json.data;
            if (cat) {
                return {
                    title: `${cat.name} | JP DK Streetwear`,
                    description: cat.description || `${cat.name} — Colección de streetwear JP DK.`,
                    alternates: { canonical: `${SITE_URL}/catalog?category=${category}` },
                };
            }
        }
    } catch {}

    return { title: 'Catálogo | JP DK Streetwear' };
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<CatalogPageSkeleton />}>
            <CatalogPageClient />
        </Suspense>
    );
}
