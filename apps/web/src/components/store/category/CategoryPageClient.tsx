'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchCategories, getCategoryBySlug } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import { Category, Product } from '@/types';
import CategoryPageEmpty from './CategoryPage.empty';
import CategoryPageGrid from './CategoryPage.grid';
import CategoryPageHeader from './CategoryPage.header';
import CategoryPageNotFound from './CategoryPage.not-found';
import CategoryPageSkeleton from './CategoryPage.skeleton';

interface CategoryPageClientProps {
    initialCategory?: Category;
    initialProducts?: Product[];
}

export default function CategoryPageClient({ initialCategory, initialProducts }: CategoryPageClientProps) {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug;

    const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
    const [category, setCategory] = useState<Category | null>(initialCategory ?? null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(!initialCategory);

    useEffect(() => {
        fetchCategories({ isPublished: true })
            .then(setCategories)
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (initialCategory) return;

        const loadData = async () => {
            if (!slug) return;

            setLoading(true);

            try {
                const allCategories = await fetchCategories({ isPublished: true });
                setCategories(allCategories);

                const currentCategory = await getCategoryBySlug(slug);
                setCategory(currentCategory || null);

                if (!currentCategory) {
                    setProducts([]);
                    return;
                }

                const productsData = await fetchProducts({ categoryId: currentCategory.id });
                setProducts(productsData);
            } catch (error) {
                console.error('Error loading category page:', error);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    if (loading) {
        return <CategoryPageSkeleton />;
    }

    if (!category || !slug) {
        return <CategoryPageNotFound />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <CategoryPageHeader categoryName={category.name} currentSlug={slug} categories={categories} />
            {products.length === 0 ? <CategoryPageEmpty /> : <CategoryPageGrid products={products} />}
        </div>
    );
}
