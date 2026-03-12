"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../../../src/components/product/ProductCard';
import { Product, Category } from '../../../src/types';
import { fetchProducts } from '../../../src/services/productService';
import { getCategoryBySlug, fetchCategories } from '../../../src/services/categoryService';
import { Button } from '@repo/ui';

const CategoryPage = () => {
    const params = useParams();
    const slug = params.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch all categories for navigation
                const allCategories = await fetchCategories();
                setCategories(allCategories);

                // Fetch current category info
                const categoryData = await getCategoryBySlug(slug);
                setCategory(categoryData || null);

                if (categoryData) {
                    // Fetch products for this category
                    // Note: We need to pass categoryId, not slug, to fetchProducts as per current implementation
                    // Or if backend supports filtering by category slug directly, that would be better.
                    // Looking at product.controller.ts, it supports categoryId query param.
                    // But let's check if we can filter by slug or if we need the ID.
                    // The fetchProducts service takes a Record<string, any>.
                    // The controller maps categoryId from query.
                    // So we use categoryData.id
                    const productsData = await fetchProducts({ categoryId: categoryData.id });
                    setProducts(productsData);
                } else {
                    // Category not found or API error
                    // Fallback: try to filter by slug match in names if mock data? 
                    // No, usually 404. For now just empty.
                    setProducts([]);
                }
            } catch (error) {
                console.error("Error loading category page:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200 w-1/4 mx-auto mb-8 rounded"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-4xl font-display font-black uppercase mb-4">Categoría no encontrada</h1>
                <Link href="/catalog">
                    <Button variant="outline">Volver al catálogo</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-4">
                    {category.name}
                </h1>

                {/* Category Navigation */}
                <div className="flex justify-center gap-6 mb-8">
                    <Link href="/catalog">
                        <span className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors border-transparent text-gray-400 hover:text-black`}>
                            Todos
                        </span>
                    </Link>
                    {categories.map(cat => (
                        <Link key={cat.id} href={`/category/${cat.slug}`}>
                            <span className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${cat.slug === slug ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No hay productos en esta categoría.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
