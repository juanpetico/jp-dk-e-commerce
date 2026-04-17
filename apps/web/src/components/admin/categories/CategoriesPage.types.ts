import { Category } from '@/types';

export type CategoryStatusFilter = 'ALL' | 'VISIBLE' | 'HIDDEN';
export type CategoryProductsFilter = 'ALL' | 'WITH' | 'WITHOUT';
export type CategorySortBy = 'NAME_ASC' | 'NAME_DESC' | 'PRODUCTS_ASC' | 'PRODUCTS_DESC';

export interface CategoriesFiltersState {
    searchInput: string;
    statusFilter: CategoryStatusFilter;
    productsFilter: CategoryProductsFilter;
    sortBy: CategorySortBy;
}

export interface CategoryEditState {
    editTarget: Category | null;
    editName: string;
    editIsPublished: boolean;
    editLoading: boolean;
    editError: string;
}
