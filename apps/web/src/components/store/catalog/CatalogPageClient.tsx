'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchProducts } from '@/services/productService';
import { Product } from '@/types';
import CatalogPageEmpty from './CatalogPage.empty';
import CatalogPageGrid from './CatalogPage.grid';
import CatalogPageHero from './CatalogPage.hero';
import CatalogPageQuickFilters from './CatalogPage.quick-filters';
import { CatalogFilter } from './CatalogPage.types';
import { CATALOG_CATEGORIES, getCatalogCounts, getFilteredProducts, normalizeCategoryToFilter } from './CatalogPage.utils';

export default function CatalogPageClient() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category');
    const initialSearch = searchParams.get('search');

    const [products, setProducts] = useState<Product[]>([]);
    const [filter, setFilter] = useState<CatalogFilter>('All');
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');

    useEffect(() => {
        setFilter(normalizeCategoryToFilter(initialCategory));
        if (initialSearch) {
            setSearchTerm(initialSearch);
        }
    }, [initialCategory, initialSearch]);

    useEffect(() => {
        const loadProducts = async () => {
            const allProducts = await fetchProducts();
            setProducts(allProducts);
        };

        void loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return getFilteredProducts(products, filter, searchTerm);
    }, [products, filter, searchTerm]);

    const counts = useMemo(() => {
        return getCatalogCounts(products);
    }, [products]);

    return (
        <div className="min-h-screen pb-12">
            <CatalogPageHero filter={filter} counts={counts} onFilterChange={setFilter} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <CatalogPageQuickFilters
                    filter={filter}
                    searchTerm={searchTerm}
                    filteredCount={filteredProducts.length}
                    categories={CATALOG_CATEGORIES}
                    onFilterChange={setFilter}
                    onClearSearch={() => setSearchTerm('')}
                />

                {filteredProducts.length > 0 ? (
                    <CatalogPageGrid products={filteredProducts} />
                ) : (
                    <CatalogPageEmpty
                        onReset={() => {
                            setFilter('All');
                            setSearchTerm('');
                        }}
                    />
                )}
            </div>
        </div>
    );
}
