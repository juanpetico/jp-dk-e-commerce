'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchCategories } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import { Category, Product } from '@/types';
import CatalogPageEmpty from './CatalogPage.empty';
import CatalogPageGrid from './CatalogPage.grid';
import CatalogPageHero from './CatalogPage.hero';
import CatalogPageQuickFilters from './CatalogPage.quick-filters';
import { CatalogFilter, CatalogHeroImageMap } from './CatalogPage.types';
import { CATALOG_CATEGORIES, getCatalogCounts, getFilteredProducts, normalizeCategoryToFilter } from './CatalogPage.utils';

export default function CatalogPageClient() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category');
    const initialSearch = searchParams.get('search');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
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

        const loadCategories = async () => {
            const categoryList = await fetchCategories({ isPublished: true });
            setCategories(categoryList);
        };

        void loadProducts();
        void loadCategories();
    }, []);

    const filteredProducts = useMemo(() => {
        return getFilteredProducts(products, filter, searchTerm);
    }, [products, filter, searchTerm]);

    const counts = useMemo(() => {
        return getCatalogCounts(products);
    }, [products]);

    const imagesByFilter = useMemo<CatalogHeroImageMap>(() => {
        const mapBySlug = new Map(
            categories
                .filter((category) => typeof category.imageUrl === 'string' && category.imageUrl.trim() !== '')
                .map((category) => [category.slug.toLowerCase(), category.imageUrl as string])
        );

        return {
            Poleras: mapBySlug.get('poleras'),
            Polerones: mapBySlug.get('polerones'),
            Lentes: mapBySlug.get('lentes'),
        };
    }, [categories]);

    return (
        <div className="min-h-screen pb-12">
            <CatalogPageHero filter={filter} counts={counts} imagesByFilter={imagesByFilter} onFilterChange={setFilter} />

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
