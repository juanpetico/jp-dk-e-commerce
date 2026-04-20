export interface CategoryFilters {
    isPublished?: boolean;
}

export interface CategoryFieldsUpdateInput {
    name?: string;
    imageUrl?: string | null;
    isPublished?: boolean;
    sortOrder?: number;
}

export interface CreateCategoryInput {
    name: string;
    imageUrl?: string | null;
}
