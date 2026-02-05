"use client";

import React, { useEffect, useState } from 'react';
import ProductCard from '../../src/components/product/ProductCard';
import { Product } from '../../src/types';
import { fetchProducts } from '../../src/services/productService';
import { Button } from '../../src/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchProducts().then(setProducts);
    }, []);

    const filteredProducts = filter === 'All'
        ? products
        : products.filter(p => p.category.name === filter || p.category.slug === filter.toLowerCase() || (filter === 'Poleras' && p.category.name === 'Poleras') || (filter === 'Polerones' && p.category.name === 'Polerones') || (filter === 'Lentes' && p.category.name === 'Lentes'));

    const categories = ['All', 'Poleras', 'Polerones', 'Lentes'];

    // Calculate counts for display in the big blocks
    const polerasCount = products.filter(p => p.category.name === 'Poleras' || p.category.slug === 'poleras').length;
    const poleronesCount = products.filter(p => p.category.name === 'Polerones' || p.category.slug === 'polerones').length;
    const lentesCount = products.filter(p => p.category.name === 'Lentes' || p.category.slug === 'lentes').length;

    return (
        <div className="min-h-screen pb-12">

            {/* Brutalist Typographic Header (No Images) */}
            <div className="mb-12 border-b border-black">
                <div className="grid grid-cols-1 md:grid-cols-3 h-[40vh] md:h-[50vh]">

                    {/* Block: Poleras (Black Theme) */}
                    <div
                        onClick={() => setFilter('Poleras')}
                        className={`
                    relative group cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all duration-500
                    border-b md:border-b-0 md:border-r border-white/20
                    ${filter === 'Poleras' ? 'bg-black text-white flex-[1.2]' : 'bg-neutral-900 text-gray-400 hover:bg-black hover:text-white flex-1'}
                `}
                    >
                        {/* Background Text Effect (Subtle) */}
                        <span className="absolute text-[8rem] md:text-[10rem] font-display font-black italic opacity-5 pointer-events-none select-none whitespace-nowrap transform -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                            TSHIRT
                        </span>

                        <div className="relative z-10 text-center transform transition-transform duration-300 group-hover:-translate-y-2">
                            <h2 className="text-4xl md:text-6xl font-display font-black italic tracking-tighter uppercase">
                                Poleras
                            </h2>
                            <div className="flex items-center justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-xs font-bold tracking-widest uppercase border border-current px-3 py-1 rounded-full">
                                    {polerasCount} Productos
                                </span>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Active Indicator */}
                        {filter === 'Poleras' && (
                            <div className="absolute bottom-6 left-0 right-0 text-center animate-fade-in">
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Seleccionado
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Block: Polerones (White/Gray Theme) */}
                    <div
                        onClick={() => setFilter('Polerones')}
                        className={`
                    relative group cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all duration-500
                    border-b md:border-b-0 md:border-r border-gray-200
                    ${filter === 'Polerones' ? 'bg-white text-black flex-[1.2]' : 'bg-gray-100 text-gray-500 hover:bg-white hover:text-black flex-1'}
                `}
                    >
                        {/* Background Text Effect */}
                        <span className="absolute text-[8rem] md:text-[10rem] font-display font-black italic opacity-5 pointer-events-none select-none whitespace-nowrap transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                            HOODIE
                        </span>

                        <div className="relative z-10 text-center transform transition-transform duration-300 group-hover:-translate-y-2">
                            <h2 className="text-4xl md:text-6xl font-display font-black italic tracking-tighter uppercase">
                                Polerones
                            </h2>
                            <div className="flex items-center justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-xs font-bold tracking-widest uppercase border border-current px-3 py-1 rounded-full">
                                    {poleronesCount} Productos
                                </span>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Active Indicator */}
                        {filter === 'Polerones' && (
                            <div className="absolute bottom-6 left-0 right-0 text-center animate-fade-in">
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                                    Seleccionado
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Block: Lentes (Black/Dark Theme) */}
                    <div
                        onClick={() => setFilter('Lentes')}
                        className={`
                    relative group cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all duration-500
                    ${filter === 'Lentes' ? 'bg-neutral-800 text-white flex-[1.2]' : 'bg-neutral-900 text-gray-500 hover:bg-neutral-800 hover:text-white flex-1'}
                `}
                    >
                        {/* Background Text Effect */}
                        <span className="absolute text-[8rem] md:text-[10rem] font-display font-black italic opacity-5 pointer-events-none select-none whitespace-nowrap transform -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                            SHADES
                        </span>

                        <div className="relative z-10 text-center transform transition-transform duration-300 group-hover:-translate-y-2">
                            <h2 className="text-4xl md:text-6xl font-display font-black italic tracking-tighter uppercase">
                                Lentes
                            </h2>
                            <div className="flex items-center justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-xs font-bold tracking-widest uppercase border border-current px-3 py-1 rounded-full">
                                    {lentesCount} Productos
                                </span>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Active Indicator */}
                        {filter === 'Lentes' && (
                            <div className="absolute bottom-6 left-0 right-0 text-center animate-fade-in">
                                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                    Seleccionado
                                </span>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Quick Filter Bar (Minimal) */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-100 pb-6 gap-4">
                    <h1 className="text-2xl font-display font-bold uppercase tracking-tight flex items-center gap-2">
                        {filter === 'All' ? 'Catálogo Completo' : filter}
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full align-middle font-sans">
                            {filteredProducts.length}
                        </span>
                    </h1>

                    {/* Quick Filter Buttons */}
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${filter === cat
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {cat === 'All' ? 'Ver Todo' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12 animate-fade-in">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-400 font-display text-xl uppercase tracking-wide">Sin stock disponible</p>
                        <Button variant="outline" className="mt-4" onClick={() => setFilter('All')}>Ver todo el catálogo</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogPage;
