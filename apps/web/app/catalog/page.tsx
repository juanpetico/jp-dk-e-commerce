"use client";

import React, { useEffect, useState } from 'react';
import ProductCard from '../../src/components/product/ProductCard';
import { Product } from '../../src/types';
import { fetchProducts } from '../../src/services/productService';

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchProducts().then(setProducts);
    }, []);

    const filteredProducts = filter === 'All'
        ? products
        : products.filter(p => p.category === filter);

    const categories = ['All', 'Poleras', 'Polerones'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight mb-4">Catálogo</h1>
                <div className="flex justify-center gap-4">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${filter === cat ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default CatalogPage;
