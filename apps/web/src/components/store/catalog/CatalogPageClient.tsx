'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchCategories } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import { Category, Product } from '@/types';
import CatalogPageEmpty from './CatalogPage.empty';
import CatalogPageGrid from './CatalogPage.grid';
import CatalogPageHero from './CatalogPage.hero';
import CatalogPageQuickFilters from './CatalogPage.quick-filters';
import CatalogPageSkeleton from './CatalogPage.skeleton';
import { CatalogFilter, HeroCategory } from './CatalogPage.types';
import { getCatalogCounts, getFilteredProducts, normalizeCategoryToFilter } from './CatalogPage.utils';

export default function CatalogPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filter, setFilter] = useState<CatalogFilter>(() =>
        normalizeCategoryToFilter(searchParams.get('category')),
    );
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setFilter(normalizeCategoryToFilter(searchParams.get('category')));
        const s = searchParams.get('search');
        if (s !== null) setSearchTerm(s);
    }, [searchParams]);

    useEffect(() => {
        const loadData = async () => {
            const [allProducts, categoryList] = await Promise.all([
                fetchProducts(),
                fetchCategories({ isPublished: true }),
            ]);
            setProducts(allProducts);
            setCategories(categoryList);
            setLoading(false);
        };
        void loadData();
    }, []);

    const handleFilterChange = (nextFilter: CatalogFilter) => {
        const params = new URLSearchParams(searchParams.toString());
        if (nextFilter === 'All') {
            params.delete('category');
        } else {
            params.set('category', nextFilter);
        }
        const query = params.toString();
        router.push(query ? `/catalog?${query}` : '/catalog', { scroll: false });
    };

    const heroCategories = useMemo<HeroCategory[]>(() => {
        return categories
            .filter((c) => c.showInHero)
            .slice(0, 3)
            .map((c) => ({ slug: c.slug, name: c.name, imageUrl: c.imageUrl }));
    }, [categories]);

    const allCategoriesForFilters = useMemo<HeroCategory[]>(() => {
        return categories.map((c) => ({ slug: c.slug, name: c.name, imageUrl: c.imageUrl }));
    }, [categories]);

    const filteredProducts = useMemo(() => {
        return getFilteredProducts(products, filter, searchTerm);
    }, [products, filter, searchTerm]);

    const counts = useMemo(() => {
        return getCatalogCounts(products, categories);
    }, [products, categories]);

    if (loading) return <CatalogPageSkeleton />;

    return (
        <div className="min-h-screen pb-12 pt-28">
            <CatalogPageHero
                filter={filter}
                counts={counts}
                heroCategories={heroCategories}
                onFilterChange={handleFilterChange}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <CatalogPageQuickFilters
                    filter={filter}
                    searchTerm={searchTerm}
                    filteredCount={filteredProducts.length}
                    allCategories={allCategoriesForFilters}
                    onFilterChange={handleFilterChange}
                    onClearSearch={() => setSearchTerm('')}
                />

                {filteredProducts.length > 0 ? (
                    <CatalogPageGrid products={filteredProducts} />
                ) : (
                    <CatalogPageEmpty
                        onReset={() => {
                            setSearchTerm('');
                            handleFilterChange('All');
                        }}
                    />
                )}
            </div>
        </div>
    );
}
