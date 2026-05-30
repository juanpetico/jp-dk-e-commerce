import { Category, Product } from '@/types';
import { CatalogFilter } from './CatalogPage.types';

export const normalizeCategoryToFilter = (category: string | null): CatalogFilter => {
    if (!category) return 'All';
    return category;
};

const isProductFromFilter = (product: Product, filter: CatalogFilter): boolean => {
    if (filter === 'All') return true;
    return product.category.slug === filter || product.category.name.toLowerCase() === filter.toLowerCase();
};

export const getFilteredProducts = (products: Product[], filter: CatalogFilter, searchTerm: string): Product[] => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
        const matchesCategory = isProductFromFilter(product, filter);
        const matchesSearch =
            normalizedSearchTerm === '' || product.name.toLowerCase().includes(normalizedSearchTerm);
        return matchesCategory && matchesSearch;
    });
};

export const getCatalogCounts = (products: Product[], categories: Category[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const category of categories) {
        counts[category.slug] = products.filter((p) => isProductFromFilter(p, category.slug)).length;
    }
    return counts;
};
