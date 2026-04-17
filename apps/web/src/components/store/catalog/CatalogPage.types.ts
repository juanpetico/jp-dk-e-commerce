import { Product } from '@/types';

export type CatalogFilter = 'All' | 'Poleras' | 'Polerones' | 'Lentes';

export interface CatalogHeroProps {
    filter: CatalogFilter;
    counts: Record<Exclude<CatalogFilter, 'All'>, number>;
    onFilterChange: (nextFilter: CatalogFilter) => void;
}

export interface CatalogQuickFiltersProps {
    filter: CatalogFilter;
    searchTerm: string;
    filteredCount: number;
    categories: CatalogFilter[];
    onFilterChange: (nextFilter: CatalogFilter) => void;
    onClearSearch: () => void;
}

export interface CatalogGridProps {
    products: Product[];
}
