import { Product } from '@/types';
import { getProductImageFallbackDataUrl } from '@/lib/product-image-fallback';
import { SearchOverlayCategory } from './SearchOverlay.types';

const CATEGORY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const getProductFallbackImage = () => getProductImageFallbackDataUrl();

export const formatProductPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

export const isPublishedCategory = (category: SearchOverlayCategory) => {
    return category.isPublished !== false;
};

export const isProductFromPublishedCategory = (product: Product) => {
    return product.category?.isPublished !== false;
};

export const fetchPublishedCategories = async (): Promise<SearchOverlayCategory[]> => {
    const response = await fetch(`${CATEGORY_API_URL}/categories?isPublished=true`);
    const data = await response.json();

    if (!data.success) {
        return [];
    }

    return (data.data || []).filter(isPublishedCategory);
};

export const filterCategoriesBySearchTerm = (categories: SearchOverlayCategory[], searchTerm: string) => {
    const normalizedTerm = searchTerm.toLowerCase();
    return categories.filter((category) => isPublishedCategory(category) && category.name.toLowerCase().includes(normalizedTerm));
};

export const getProductCategories = (products: Product[]) => {
    return products
        .map((product) => product.category)
        .filter((category): category is SearchOverlayCategory => Boolean(category && category.id && category.isPublished !== false));
};

export const mergeCategorySuggestions = (
    categoriesByName: SearchOverlayCategory[],
    categoriesFromProducts: SearchOverlayCategory[],
) => {
    const uniqueCategories = new Map<string, SearchOverlayCategory>();

    categoriesByName.forEach((category) => uniqueCategories.set(category.id, category));
    categoriesFromProducts.forEach((category) => uniqueCategories.set(category.id, category));

    return Array.from(uniqueCategories.values());
};
