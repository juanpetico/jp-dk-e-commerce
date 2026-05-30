import { Product } from '@/types';

export type CatalogFilter = string; // 'All' | category slug

export interface HeroCategory {
    slug: string;
    name: string;
    imageUrl?: string | null;
}

export interface CatalogHeroProps {
    filter: CatalogFilter;
    counts: Record<string, number>;
    heroCategories: HeroCategory[];
    onFilterChange: (nextFilter: CatalogFilter) => void;
}

export interface CatalogQuickFiltersProps {
    filter: CatalogFilter;
    searchTerm: string;
    filteredCount: number;
    allCategories: HeroCategory[];
    onFilterChange: (nextFilter: CatalogFilter) => void;
    onClearSearch: () => void;
}

export interface CatalogGridProps {
    products: Product[];
}
