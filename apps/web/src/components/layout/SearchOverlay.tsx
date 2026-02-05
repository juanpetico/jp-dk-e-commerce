'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
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


    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        } else {
            document.body.style.overflow = 'unset';
            setSearchTerm(''); // Optional: clear on close if desired, reference does handleClear but also keeps state? Reference clears on handleClear.
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
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
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm flex flex-col pt-[112px] animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white/95 dark:bg-black/95 text-black dark:text-white flex flex-col shadow-xl max-h-[70vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header / Input Area */}
                <div className="relative pt-6 px-4 md:px-8 pb-4">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="border border-gray-300 dark:border-gray-700 px-4 py-3 flex items-center bg-white dark:bg-black">
                            <div className="flex flex-col flex-1">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                                    Búsqueda
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent text-black dark:text-white text-lg font-medium focus:outline-none w-full placeholder-gray-400"
                                    placeholder="Buscar productos..."
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                {searchTerm && (
                                    <button onClick={handleClear} className="text-gray-400 hover:text-black dark:hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <Search className="w-6 h-6 text-black dark:text-white" />

                                {/* Close Overlay Button */}
                                <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-4xl mx-auto w-full">
                        {(searchTerm.length > 0 && (suggestions.length > 0 || products.length > 0)) ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Suggestions Column */}
                                <div className="md:col-span-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        Sugerencias
                                    </h3>
                                    <ul className="space-y-3">
                                        {suggestions.map(cat => (
                                            <li key={cat.id}>
                                                <Link
                                                    href={`/catalog?category=${cat.id}`}
                                                    onClick={onClose}
                                                    className="text-black dark:text-white font-bold text-sm hover:underline hover:text-gray-600 dark:hover:text-gray-300 block"
                                                >
                                                    {cat.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Products Column */}
                                <div className="md:col-span-8">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        Productos
                                    </h3>
                                    <div className="space-y-4">
                                        {products.map(product => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={onClose}
                                                className="flex items-center gap-4 group hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded transition-colors"
                                            >
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                                    />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-black dark:text-white group-hover:underline block">
                                                        {product.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(product.price)}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : searchTerm.length > 0 && products.length === 0 && !isLoading ? (
                            <div className="text-center text-gray-500 mt-4 pb-8">
                                <p>No se encontraron resultados para "{searchTerm}"</p>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Footer Action Bar */}
                {searchTerm.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                        <div className="max-w-4xl mx-auto w-full">
                            <Link
                                href={`/catalog?search=${encodeURIComponent(searchTerm)}`}
                                onClick={onClose}
                                className="flex items-center justify-between text-black dark:text-white font-bold uppercase tracking-wider text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
