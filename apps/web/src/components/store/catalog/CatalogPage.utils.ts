import { Product } from '@/types';
import { CatalogFilter } from './CatalogPage.types';

export const CATALOG_CATEGORIES: CatalogFilter[] = ['All', 'Poleras', 'Polerones', 'Lentes'];

export const normalizeCategoryToFilter = (category: string | null): CatalogFilter => {
    if (!category) return 'All';

    const normalized = category.toLowerCase();
    if (normalized === 'poleras') return 'Poleras';
    if (normalized === 'polerones') return 'Polerones';
    if (normalized === 'lentes') return 'Lentes';

    return 'All';
};

const isProductFromFilter = (product: Product, filter: CatalogFilter) => {
    if (filter === 'All') return true;

    return product.category.name === filter || product.category.slug === filter.toLowerCase();
};

export const getFilteredProducts = (products: Product[], filter: CatalogFilter, searchTerm: string) => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
        const matchesCategory = isProductFromFilter(product, filter);
        const matchesSearch =
            normalizedSearchTerm === '' || product.name.toLowerCase().includes(normalizedSearchTerm);

        return matchesCategory && matchesSearch;
    });
};

export const getCatalogCounts = (products: Product[]) => {
    return {
        Poleras: products.filter((product) => isProductFromFilter(product, 'Poleras')).length,
        Polerones: products.filter((product) => isProductFromFilter(product, 'Polerones')).length,
        Lentes: products.filter((product) => isProductFromFilter(product, 'Lentes')).length,
    };
};
