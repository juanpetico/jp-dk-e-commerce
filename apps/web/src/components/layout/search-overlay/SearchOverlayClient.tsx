'use client';

import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/services/productService';
import { Product } from '@/types';
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

export default function SearchOverlayClient({ isOpen, onClose }: SearchOverlayProps) {
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

    if (!isOpen) {
        return null;
    }

    return (
        <div
            data-search-overlay-root
            className="absolute top-full left-0 w-full z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300"
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
