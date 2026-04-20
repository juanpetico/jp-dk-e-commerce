'use client';

import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/services/productService';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import SearchOverlayFooter from './SearchOverlay.footer';
import SearchOverlayHeader from './SearchOverlay.header';
import SearchOverlayResults from './SearchOverlay.results';
import { SearchOverlayCategory, SearchOverlayProps } from './SearchOverlay.types';
import {
    fetchPublishedCategories,
    filterCategoriesBySearchTerm,
    getProductCategories,
    isProductFromPublishedCategory,
    mergeCategorySuggestions,
} from './SearchOverlay.utils';

export default function SearchOverlayClient({ isOpen, onClose, variant = 'fullscreen', isNavTransparent = false }: SearchOverlayProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<SearchOverlayCategory[]>([]);
    const [suggestions, setSuggestions] = useState<SearchOverlayCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const publishedCategories = await fetchPublishedCategories();
                setCategories(publishedCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length === 0) {
                setSuggestions([]);
                setProducts([]);
                return;
            }

            setIsLoading(true);
            try {
                const foundProducts = await fetchProducts({ search: searchTerm });
                const safeProducts = foundProducts.filter(isProductFromPublishedCategory);
                const categoriesByName = filterCategoriesBySearchTerm(categories, searchTerm);
                const categoriesFromProducts = getProductCategories(safeProducts);

                setProducts(safeProducts);
                setSuggestions(mergeCategorySuggestions(categoriesByName, categoriesFromProducts));
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [categories, searchTerm]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const resetSearch = () => {
        setSearchTerm('');
        setProducts([]);
        setSuggestions([]);
    };

    const handleClose = () => {
        resetSearch();
        onClose();
    };

    const handleSubmitSearch = () => {
        const trimmed = searchTerm.trim();
        if (!trimmed) return;

        router.push(`/catalog?search=${encodeURIComponent(trimmed)}`);
        resetSearch();
        onClose();
    };

    const handleClear = () => {
        resetSearch();
        inputRef.current?.focus();
    };

    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    if (variant === 'fullscreen') {
        return (
            <div
                data-search-overlay-root
                className={cn(
                    'fixed inset-0 z-[60] animate-in fade-in duration-200 flex flex-col search-overlay-fullscreen',
                    isNavTransparent
                        ? 'search-overlay-acrylic dark'
                        : 'search-overlay-solid',
                )}
                onClick={handleBackdropClick}
            >
                <div
                    className="flex-1 overflow-y-auto"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
                        <SearchOverlayHeader
                            searchTerm={searchTerm}
                            inputRef={inputRef}
                            onChangeSearchTerm={setSearchTerm}
                            onClear={handleClear}
                            onInputBlur={resetSearch}
                            onSubmitSearch={handleSubmitSearch}
                            onClose={handleClose}
                        />

                        <SearchOverlayResults
                            searchTerm={searchTerm}
                            isLoading={isLoading}
                            suggestions={suggestions}
                            products={products}
                            onClose={handleClose}
                        />

                        <SearchOverlayFooter searchTerm={searchTerm} onClose={handleClose} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            data-search-overlay-root
            className={cn(
                'absolute top-full left-0 w-full z-30 border-b border-border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300',
                isNavTransparent
                    ? 'search-overlay-acrylic dark'
                    : 'bg-background/95 backdrop-blur-md',
            )}
            onClick={handleBackdropClick}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" onClick={(event) => event.stopPropagation()}>
                <SearchOverlayHeader
                    searchTerm={searchTerm}
                    inputRef={inputRef}
                    onChangeSearchTerm={setSearchTerm}
                    onClear={handleClear}
                    onInputBlur={resetSearch}
                    onSubmitSearch={handleSubmitSearch}
                    onClose={handleClose}
                />

                <SearchOverlayResults
                    searchTerm={searchTerm}
                    isLoading={isLoading}
                    suggestions={suggestions}
                    products={products}
                    onClose={handleClose}
                />

                <SearchOverlayFooter searchTerm={searchTerm} onClose={handleClose} />
            </div>
        </div>
    );
}
