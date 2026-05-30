export interface CategoryFilters {
    isPublished?: boolean;
}

export interface CategoryFieldsUpdateInput {
    name?: string;
    imageUrl?: string | null;
    showInHero?: boolean;
    showInMenu?: boolean;
    isPublished?: boolean;
    sortOrder?: number;
}

export interface CreateCategoryInput {
    name: string;
    imageUrl?: string | null;
    showInHero?: boolean;
    showInMenu?: boolean;
    isPublished?: boolean;
}
