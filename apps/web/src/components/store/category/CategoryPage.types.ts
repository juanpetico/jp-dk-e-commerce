import { Category, Product } from '@/types';

export interface CategoryPageHeaderProps {
    categoryName: string;
    currentSlug: string;
    categories: Category[];
}

export interface CategoryPageGridProps {
    products: Product[];
}
