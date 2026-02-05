'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { fetchProducts } from '../../services/productService';
import { Product } from '../../types';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // All categories
    const [suggestions, setSuggestions] = useState<Category[]>([]); // Filtered categories
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch all categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/categories');
                const data = await res.json();
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length > 0) {
                setIsLoading(true);
                try {

                    // Fetch products from API
                    const foundProducts = await fetchProducts({ search: searchTerm });
                    setProducts(foundProducts);

                    // Filter categories locally by name
                    const nameMatches = categories.filter(cat =>
                        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    // Extract categories from found products
                    const productCategories = foundProducts.map(p => p.category);

                    // Merge and deduplicate
                    const uniqueCategoriesMap = new Map<string, Category>();

                    // Add name matches
                    nameMatches.forEach(cat => uniqueCategoriesMap.set(cat.id, cat));

                    // Add product categories
                    productCategories.forEach(cat => {
                        if (cat && cat.id) {
                            uniqueCategoriesMap.set(cat.id, cat);
                        }
                    });

                    setSuggestions(Array.from(uniqueCategoriesMap.values()));
                } catch (error) {
                    console.error("Error searching products:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
                setProducts([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, categories]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            if (inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    }, [isOpen]);

    const handleClear = () => {
        setSearchTerm('');
        setProducts([]);
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="absolute top-full left-0 w-full z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300"
            onClick={handleBackdropClick}
        >
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header / Input Area */}
                <div className="relative pt-6 px-4 md:px-8 pb-4">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="border border-border px-4 py-3 flex items-center bg-background rounded-lg">
                            <div className="flex flex-col flex-1">
                                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
                                    Búsqueda
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent text-foreground text-lg font-medium focus:outline-none w-full placeholder-muted-foreground"
                                    placeholder="Buscar productos..."
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                {searchTerm && (
                                    <button onClick={handleClear} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <Search className="w-6 h-6 text-foreground" />

                                {/* Close Overlay Button */}
                                <button onClick={onClose} className="text-muted-foreground hover:text-destructive transition-colors ml-2 pl-2 border-l border-border">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 border-t border-border">
                    <div className="max-w-4xl mx-auto w-full">
                        {(searchTerm.length > 0 && (suggestions.length > 0 || products.length > 0)) ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Suggestions Column */}
                                <div className="md:col-span-4">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                        Sugerencias
                                    </h3>
                                    <ul className="space-y-3">
                                        {suggestions.map(cat => (
                                            <li key={cat.id}>
                                                <Link
                                                    href={`/catalog?category=${cat.id}`}
                                                    onClick={onClose}
                                                    className="text-foreground font-bold text-sm hover:underline hover:text-muted-foreground block"
                                                >
                                                    {cat.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Products Column */}
                                <div className="md:col-span-8">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                        Productos
                                    </h3>
                                    <div className="space-y-4">
                                        {products.map(product => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={onClose}
                                                className="flex items-center gap-4 group hover:bg-accent p-2 rounded transition-colors"
                                            >
                                                <div className="w-12 h-12 bg-muted flex-shrink-0 rounded-md overflow-hidden">
                                                    <img
                                                        src={product.images && product.images[0] ? product.images[0].url : '/placeholder.jpg'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-foreground group-hover:underline block">
                                                        {product.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : searchTerm.length > 0 && products.length === 0 && !isLoading ? (
                            <div className="text-center text-muted-foreground mt-4 pb-8">
                                <p>No se encontraron resultados para "{searchTerm}"</p>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Footer Action Bar */}
                {searchTerm.length > 0 && (
                    <div className="border-t border-border bg-muted/50 p-4">
                        <div className="max-w-4xl mx-auto w-full">
                            <Link
                                href={`/catalog?search=${encodeURIComponent(searchTerm)}`}
                                onClick={onClose}
                                className="flex items-center justify-between text-foreground font-bold uppercase tracking-wider text-sm hover:text-muted-foreground transition-colors"
                            >
                                <span>Buscar "{searchTerm}"</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
